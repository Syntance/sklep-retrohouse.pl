import "server-only";
import { env } from "@/env";
import {
	SYSTEM_PAYMENT_PROVIDER_ID,
	TPAY_PROVIDER_ID,
} from "@/lib/medusa/checkout-helpers";
import { getProductBySlug } from "@/lib/products/queries";
import type { CheckoutInput } from "@/lib/validation/checkout";

const BASE_URL = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, "");
const PUBLISHABLE_KEY = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

const SHIPPING_LABELS: Record<CheckoutInput["shipping"], string> = {
	inpost: "InPost Paczkomaty",
	dpd: "Kurier DPD",
	dhl: "Kurier DHL",
	pickup_nt: "Odbiór osobisty — Nowy Targ",
};

const PAYMENT_LABELS: Record<CheckoutInput["payment_provider_id"], string> = {
	[TPAY_PROVIDER_ID]: "Tpay (BLIK / przelew / karta)",
	[SYSTEM_PAYMENT_PROVIDER_ID]: "Przelew tradycyjny",
};

export type CreateOrderResult =
	| { ok: true; orderId: string; displayId: number }
	| { ok: true; redirectUrl: string; cartId: string }
	| { ok: false; error: string };

async function storeFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
	const headers = new Headers(init.headers);
	headers.set("x-publishable-api-key", PUBLISHABLE_KEY ?? "");
	if (init.body) headers.set("Content-Type", "application/json");

	const res = await fetch(`${BASE_URL}${path}`, {
		...init,
		headers,
		cache: "no-store",
		signal: AbortSignal.timeout(30_000),
	});

	const text = await res.text();
	let json: unknown;
	try {
		json = text ? JSON.parse(text) : {};
	} catch {
		json = {};
	}

	if (!res.ok) {
		const message =
			(json as { message?: string })?.message ?? `Błąd Medusa (${res.status}).`;
		throw new Error(message);
	}
	return json as T;
}

type StoreCart = {
	id: string;
	payment_collection?: { id: string } | null;
};

type StoreShippingOption = { id: string; name: string };

type PaymentSessionData = {
	payment_url?: string;
};

/**
 * Pełny flow zakupu w Medusa: koszyk → wysyłka → płatność → zamówienie lub redirect Tpay.
 * Cena liczona po stronie Medusa (region PLN), klient przekazuje tylko sluga pozycji.
 */
export async function createMedusaOrder(input: CheckoutInput): Promise<CreateOrderResult> {
	const { regions } = await storeFetch<{ regions: Array<{ id: string; currency_code: string }> }>(
		"/store/regions",
	);
	const regionId = regions.find((r) => r.currency_code === "pln")?.id ?? regions[0]?.id;
	if (!regionId) return { ok: false, error: "Brak skonfigurowanego regionu sprzedaży." };

	const products = await Promise.all(input.items.map((slug) => getProductBySlug(slug)));
	const lineItems = products
		.map((product) => product?.medusaVariantId)
		.filter((variantId): variantId is string => Boolean(variantId))
		.map((variantId) => ({ variant_id: variantId, quantity: 1 }));

	if (lineItems.length === 0) {
		return { ok: false, error: "Produkty z koszyka są już niedostępne." };
	}

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
		payment: PAYMENT_LABELS[input.payment_provider_id],
		payment_provider_id: input.payment_provider_id,
	};
	if (input.invoice) {
		metadata.invoice = "tak";
		if (input.nip) metadata.nip = input.nip;
		if (input.companyName) metadata.companyName = input.companyName;
	}

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

	const { shipping_options: options } = await storeFetch<{
		shipping_options: StoreShippingOption[];
	}>(`/store/shipping-options?cart_id=${cart.id}`);

	if (options.length === 0) {
		return { ok: false, error: "Brak dostępnej metody wysyłki dla tego adresu." };
	}

	const wantsPickup = input.shipping === "pickup_nt";
	const chosen =
		options.find((option) =>
			wantsPickup
				? /odbiór|odbior|pickup/i.test(option.name)
				: /kurier|inpost|dpd|dhl/i.test(option.name),
		) ?? options[0];

	await storeFetch(`/store/carts/${cart.id}/shipping-methods`, {
		method: "POST",
		body: JSON.stringify({ option_id: chosen.id }),
	});

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

	const providerId = input.payment_provider_id ?? SYSTEM_PAYMENT_PROVIDER_ID;

	await storeFetch(`/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
		method: "POST",
		body: JSON.stringify({ provider_id: providerId }),
	});

	if (providerId === TPAY_PROVIDER_ID) {
		const { payment_collection } = await storeFetch<{
			payment_collection: {
				payment_sessions?: Array<{
					provider_id: string;
					data?: PaymentSessionData;
				}>;
			};
		}>(`/store/payment-collections/${paymentCollectionId}?fields=*payment_sessions`);

		const tpaySession = payment_collection.payment_sessions?.find(
			(session) => session.provider_id === TPAY_PROVIDER_ID,
		);
		const paymentUrl = tpaySession?.data?.payment_url;

		if (!paymentUrl) {
			return { ok: false, error: "Nie udało się zainicjować płatności Tpay." };
		}

		return {
			ok: true,
			redirectUrl: paymentUrl,
			cartId: cart.id,
		};
	}

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
