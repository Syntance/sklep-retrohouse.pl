import "server-only";
import { env } from "@/env";
import { freeShippingPromotionCode } from "@/lib/admin/promotion-types";
import { getProductBySlug } from "@/lib/products/queries";
import type { CheckoutInput } from "@/lib/validation/checkout";

const BASE_URL = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, "");
const PUBLISHABLE_KEY = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
const MANUAL_PAYMENT_PROVIDER = "pp_system_default";

const SHIPPING_LABELS: Record<CheckoutInput["shipping"], string> = {
	inpost: "InPost Paczkomaty",
	dpd: "Kurier DPD",
	dhl: "Kurier DHL",
	pickup_nt: "Odbiór osobisty — Nowy Targ",
};

const PAYMENT_LABELS: Record<CheckoutInput["payment"], string> = {
	blik: "BLIK (test)",
	card: "Karta (test)",
	transfer: "Przelewy24 (test)",
};

type CreateOrderResult =
	| { ok: true; orderId: string; displayId: number }
	| { ok: false; error: string };

async function storeFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
	const headers = new Headers(init.headers);
	headers.set("x-publishable-api-key", PUBLISHABLE_KEY ?? "");
	if (init.body) headers.set("Content-Type", "application/json");

	const res = await fetch(`${BASE_URL}${path}`, {
		...init,
		headers,
		cache: "no-store",
		signal: AbortSignal.timeout(15_000),
	});

	const text = await res.text();
	let json: unknown;
	try {
		json = text ? JSON.parse(text) : {};
	} catch {
		json = {};
	}

	if (!res.ok) {
		const message = (json as { message?: string })?.message ?? `Błąd Medusa (${res.status}).`;
		throw new Error(message);
	}
	return json as T;
}

type StoreCart = {
	id: string;
	payment_collection?: { id: string } | null;
};

type StoreShippingOption = { id: string; name: string };

const PICKUP_NAME_RE = /odbiór|odbior|pickup/i;

/**
 * Dobiera opcję wysyłki dla koszyka. Zwraca `null`, gdy nie da się dopasować —
 * wołający MUSI wtedy przerwać zamówienie zamiast podstawiać cokolwiek.
 */
function resolveShippingOption(
	options: StoreShippingOption[],
	input: CheckoutInput,
): StoreShippingOption | null {
	// Ścieżka właściwa: konkretne ID wybrane przez klienta w UI (z Medusy).
	// Musi nadal być dostępne dla TEGO koszyka — inaczej twardy błąd.
	if (input.shippingOptionId && !input.shippingOptionId.startsWith("fallback:")) {
		return options.find((option) => option.id === input.shippingOptionId) ?? null;
	}

	// Ścieżka awaryjna (brak MEDUSA_ADMIN_* → UI pokazało listę zastępczą):
	// dobieramy po rodzaju, ale bez cichego podstawiania czegokolwiek.
	const wantsPickup =
		input.shippingOptionId === "fallback:pickup" || input.shipping === "pickup_nt";

	return (
		options.find((option) =>
			wantsPickup ? PICKUP_NAME_RE.test(option.name) : !PICKUP_NAME_RE.test(option.name),
		) ?? null
	);
}

/**
 * Pełny flow zakupu w Medusa: koszyk → wysyłka → płatność (manualna/testowa) → zamówienie.
 * Cena liczona po stronie Medusa (region PLN), klient przekazuje tylko sluga pozycji.
 */
export async function createMedusaOrder(input: CheckoutInput): Promise<CreateOrderResult> {
	// 1. Region PLN + warianty z katalogu (walidacja, że produkt istnieje).
	const { regions } = await storeFetch<{ regions: Array<{ id: string; currency_code: string }> }>(
		"/store/regions",
	);
	const regionId = regions.find((r) => r.currency_code === "pln")?.id ?? regions[0]?.id;
	if (!regionId) return { ok: false, error: "Brak skonfigurowanego regionu sprzedaży." };

	const products = await Promise.all(input.items.map((slug) => getProductBySlug(slug)));

	// Antyki to unikaty — jeśli którakolwiek pozycja zniknęła, NIE składamy
	// okrojonego zamówienia po cichu. Klient musi zobaczyć, czego brakuje.
	const unavailable = input.items.filter((_, index) => !products[index]?.medusaVariantId);
	if (unavailable.length > 0) {
		return {
			ok: false,
			error:
				unavailable.length === input.items.length
					? "Produkty z koszyka są już niedostępne."
					: `Te pozycje są już niedostępne: ${unavailable.join(", ")}. Usuń je z koszyka i spróbuj ponownie.`,
		};
	}

	const lineItems = products
		.map((product) => product?.medusaVariantId)
		.filter((variantId): variantId is string => Boolean(variantId))
		.map((variantId) => ({ variant_id: variantId, quantity: 1 }));

	const address = {
		first_name: input.firstName,
		last_name: input.lastName,
		address_1: input.address,
		city: input.city,
		postal_code: input.postal,
		country_code: "pl",
		phone: input.phone,
		company: input.companyName || "",
	};

	const metadata: Record<string, string> = {
		shipping: SHIPPING_LABELS[input.shipping],
		payment: PAYMENT_LABELS[input.payment],
	};
	if (input.invoice) {
		metadata.invoice = "tak";
		if (input.nip) metadata.nip = input.nip;
		if (input.companyName) metadata.companyName = input.companyName;
	}
	if (input.promoCode?.trim()) {
		metadata.promoCode = input.promoCode.trim().toUpperCase();
	}

	// 2. Koszyk.
	const { cart } = await storeFetch<{ cart: StoreCart }>("/store/carts", {
		method: "POST",
		body: JSON.stringify({
			region_id: regionId,
			email: input.email,
			items: lineItems,
			shipping_address: address,
			billing_address: address,
			metadata,
		}),
	});

	// 3. Metoda wysyłki. Wybór jedzie po ID opcji Medusy; przy braku dopasowania
	// przerywamy zamówienie. Wcześniejszy `?? options[0]` po cichu podstawiał
	// pierwszą z brzegu opcję — klient wybierał darmowy odbiór osobisty, a
	// dostawał (i płacił) kuriera.
	const { shipping_options: options } = await storeFetch<{
		shipping_options: StoreShippingOption[];
	}>(`/store/shipping-options?cart_id=${cart.id}`);

	if (options.length === 0) {
		return { ok: false, error: "Brak dostępnej metody wysyłki dla tego adresu." };
	}

	const chosen = resolveShippingOption(options, input);
	if (!chosen) {
		return {
			ok: false,
			error: "Wybrana metoda dostawy jest niedostępna. Odśwież stronę i wybierz ponownie.",
		};
	}

	await storeFetch(`/store/carts/${cart.id}/shipping-methods`, {
		method: "POST",
		body: JSON.stringify({ option_id: chosen.id }),
	});

	// 3.5. Kod promocyjny — po dodaniu metody wysyłki (rabat na dostawę wymaga
	// istniejącej metody w koszyku). Weryfikacja: kod musi faktycznie wisieć na
	// koszyku po aplikacji — Medusa ignoruje nieznane/nieaktywne kody po cichu.
	const promoCode = input.promoCode?.trim().toUpperCase();
	if (promoCode) {
		await storeFetch(`/store/carts/${cart.id}/promotions`, {
			method: "POST",
			body: JSON.stringify({ promo_codes: [promoCode] }),
		}).catch(() => undefined);

		const { cart: cartWithPromos } = await storeFetch<{
			cart: { promotions?: Array<{ id?: string; code?: string }> };
		}>(`/store/carts/${cart.id}?fields=id,*promotions`);

		const applied = (cartWithPromos.promotions ?? []).find(
			(p) => p.code?.toUpperCase() === promoCode,
		);
		if (!applied) {
			return { ok: false, error: "Kod rabatowy jest nieprawidłowy lub nieaktywny." };
		}

		// Cień darmowej dostawy (kod łączy rabat + gratis dostawę) — best-effort.
		if (applied.id) {
			await storeFetch(`/store/carts/${cart.id}/promotions`, {
				method: "POST",
				body: JSON.stringify({ promo_codes: [freeShippingPromotionCode(applied.id)] }),
			}).catch(() => undefined);
		}
	}

	// 4. Płatność manualna (test) — kolekcja + sesja.
	await storeFetch("/store/payment-collections", {
		method: "POST",
		body: JSON.stringify({ cart_id: cart.id }),
	});

	const { cart: cartWithPc } = await storeFetch<{ cart: StoreCart }>(
		`/store/carts/${cart.id}?fields=id,*payment_collection`,
	);
	const paymentCollectionId = cartWithPc.payment_collection?.id;
	if (!paymentCollectionId) {
		return { ok: false, error: "Nie udało się zainicjować płatności." };
	}

	await storeFetch(`/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
		method: "POST",
		body: JSON.stringify({ provider_id: MANUAL_PAYMENT_PROVIDER }),
	});

	// 5. Finalizacja → zamówienie.
	const completed = await storeFetch<
		| { type: "order"; order: { id: string; display_id: number } }
		| { type: "cart"; error?: { message?: string } }
	>(`/store/carts/${cart.id}/complete`, { method: "POST" });

	if (completed.type !== "order") {
		return {
			ok: false,
			error: completed.error?.message ?? "Nie udało się sfinalizować zamówienia.",
		};
	}

	return {
		ok: true,
		orderId: completed.order.id,
		displayId: completed.order.display_id,
	};
}
