import "server-only";

import { cache } from "react";
import { resolveProductThumbnailUrl } from "@/lib/medusa/product-thumbnail";
import { adminFetch } from "./medusa-admin";
import { listShippingOptionsAdmin } from "./shipping-options";
import { getStoreConfig } from "./store-config";

/** Provider płatności manualnej — jak w checkoucie (pp_system_default). */
const SYSTEM_PAYMENT_PROVIDER_ID = "pp_system_default";

export type OrderFormProductOption = {
	productId: string;
	variantId: string;
	title: string;
	thumbnail: string | null;
	/** Cena w PLN (major units) lub null gdy brak ceny. */
	pricePln: number | null;
};

export type OrderFormShippingOption = {
	id: string;
	name: string;
	/** Cena w PLN (major units). */
	pricePln: number;
};

export type ManualOrderSource = "instagram" | "email" | "telefon" | "inne";

export type ManualOrderInput = {
	email: string;
	firstName: string;
	lastName: string;
	phone?: string;
	address1: string;
	postalCode: string;
	city: string;
	companyName?: string;
	nip?: string;
	orderNotes?: string;
	sourceChannel: ManualOrderSource;
	shippingOptionId: string;
	items: Array<{ variantId: string; productTitle: string }>;
	sendConfirmationEmail: boolean;
	invoiceRequested: boolean;
	/** Klucz idempotencji generowany raz na otwarcie formularza. */
	idempotencyKey: string;
};

const PICKER_FIELDS =
	"id,title,status,thumbnail,images.url,variants.id,variants.prices.amount,variants.prices.currency_code";

type MedusaVariant = {
	id: string;
	prices?: Array<{ amount?: number; currency_code?: string }> | null;
};

type MedusaProduct = {
	id: string;
	title: string;
	status?: "draft" | "published" | "proposed" | "rejected";
	thumbnail?: string | null;
	images?: Array<{ url?: string | null }> | null;
	variants?: MedusaVariant[] | null;
};

function priceOf(variant: MedusaVariant | undefined): number | null {
	const price = variant?.prices?.find((p) => p.currency_code === "pln");
	return price?.amount ?? null;
}

function mapProductToPickerOption(product: MedusaProduct): OrderFormProductOption | null {
	const variant = product.variants?.[0];
	if (!variant?.id) return null;
	return {
		productId: product.id,
		variantId: variant.id,
		title: product.title,
		thumbnail: resolveProductThumbnailUrl(product),
		pricePln: priceOf(variant),
	};
}

function mapProducts(data: MedusaProduct[]): OrderFormProductOption[] {
	return data
		.filter((product) => product.status === "published")
		.map(mapProductToPickerOption)
		.filter((row): row is OrderFormProductOption => row != null);
}

export async function listOrderFormProducts(limit = 30): Promise<OrderFormProductOption[]> {
	const fetchLimit = Math.min(Math.max(limit * 3, limit), 200);
	const data = await adminFetch<{ products: MedusaProduct[] }>(
		`/admin/products?limit=${fetchLimit}&order=title&fields=${PICKER_FIELDS}`,
	);
	return mapProducts(data.products ?? []).slice(0, limit);
}

export async function searchOrderFormProducts(query: string): Promise<OrderFormProductOption[]> {
	const trimmed = query.trim();
	if (trimmed.length < 2) return listOrderFormProducts(20);

	const data = await adminFetch<{ products: MedusaProduct[] }>(
		`/admin/products?limit=50&q=${encodeURIComponent(trimmed)}&fields=${PICKER_FIELDS}`,
	);
	return mapProducts(data.products ?? []).slice(0, 20);
}

const listShippingOptionsForOrder = cache(async (): Promise<OrderFormShippingOption[]> => {
	const options = await listShippingOptionsAdmin();
	return options.map((option) => ({
		id: option.id,
		name: option.name,
		pricePln: option.priceMajor,
	}));
});

export type OrderFormOptions = {
	shippingOptions: OrderFormShippingOption[];
	initialProducts: OrderFormProductOption[];
};

export const getOrderFormOptions = cache(async (): Promise<OrderFormOptions> => {
	const [shippingOptions, initialProducts] = await Promise.all([
		listShippingOptionsForOrder(),
		listOrderFormProducts(30),
	]);
	return { shippingOptions, initialProducts };
});

async function getAdminPolishRegionId(): Promise<string> {
	const data = await adminFetch<{
		regions: Array<{ id: string; countries?: Array<{ iso_2?: string }> }>;
	}>("/admin/regions?limit=50&fields=id,countries.iso_2");

	const region = data.regions.find((row) =>
		row.countries?.some((country) => country.iso_2 === "pl"),
	);
	const fallback = data.regions[0];
	const id = region?.id ?? fallback?.id;
	if (!id) throw new Error("Brak regionu sprzedaży w Medusie.");
	return id;
}

const SOURCE_LABELS: Record<ManualOrderSource, string> = {
	instagram: "Instagram",
	email: "E-mail",
	telefon: "Telefon",
	inne: "Inne",
};

/**
 * Zamówienie ręczne (telefon/Instagram/e-mail): draft order w Medusie →
 * convert-to-order. Antyki to unikaty — każda pozycja z ilością 1.
 */
/**
 * Szuka zamówienia/szkicu utworzonego już wcześniej tym samym kluczem.
 * Bez tego timeout po `convert-to-order` (zamówienie powstało, odpowiedź nie
 * doszła) plus ponowienie z panelu dawał drugie, realne zamówienie.
 */
async function findByIdempotencyKey(
	key: string,
): Promise<{ orderId?: string; draftId?: string }> {
	const matches = (meta: Record<string, unknown> | null | undefined) =>
		typeof meta?.manual_order_key === "string" && meta.manual_order_key === key;

	try {
		const orders = await adminFetch<{
			orders?: Array<{ id: string; metadata?: Record<string, unknown> | null }>;
		}>("/admin/orders?limit=50&order=-created_at&fields=id,metadata");
		const order = (orders.orders ?? []).find((row) => matches(row.metadata));
		if (order) return { orderId: order.id };
	} catch {
		/* brak potwierdzenia — lecimy dalej, gorszy przypadek to duplikat */
	}

	try {
		const drafts = await adminFetch<{
			draft_orders?: Array<{ id: string; metadata?: Record<string, unknown> | null }>;
		}>("/admin/draft-orders?limit=50&order=-created_at&fields=id,metadata");
		const draft = (drafts.draft_orders ?? []).find((row) => matches(row.metadata));
		if (draft) return { draftId: draft.id };
	} catch {
		/* jw. */
	}

	return {};
}

export async function createManualOrder(input: ManualOrderInput): Promise<{ orderId: string }> {
	const existing = await findByIdempotencyKey(input.idempotencyKey);
	if (existing.orderId) return { orderId: existing.orderId };
	const [regionId, storeConfig, shippingOptions] = await Promise.all([
		getAdminPolishRegionId(),
		getStoreConfig(),
		listShippingOptionsForOrder(),
	]);

	if (!storeConfig.salesChannelId) {
		throw new Error("Brak sales channel w Medusie — skonfiguruj kanał sprzedaży.");
	}

	const shipping = shippingOptions.find((option) => option.id === input.shippingOptionId);
	if (!shipping) {
		throw new Error("Wybrana metoda dostawy nie istnieje. Odśwież stronę i spróbuj ponownie.");
	}

	const address = {
		first_name: input.firstName,
		last_name: input.lastName,
		address_1: input.address1,
		postal_code: input.postalCode,
		city: input.city,
		country_code: "pl",
		phone: input.phone?.trim() || undefined,
		company: input.companyName?.trim() || undefined,
	};

	const metadata: Record<string, string> = {
		payment_provider_id: SYSTEM_PAYMENT_PROVIDER_ID,
		payment: "Przelew tradycyjny",
		shipping: shipping.name,
		manual_order_source: SOURCE_LABELS[input.sourceChannel],
		manual_order_key: input.idempotencyKey,
	};

	if (input.orderNotes?.trim()) metadata.order_notes = input.orderNotes.trim();
	if (input.nip?.trim()) metadata.nip = input.nip.trim();
	if (input.companyName?.trim()) metadata.companyName = input.companyName.trim();
	if (input.invoiceRequested) metadata.invoice = "tak";

	// Szkic z tym samym kluczem już istnieje (poprzednia próba padła po jego
	// utworzeniu) — konwertujemy go zamiast tworzyć drugi.
	const draft = existing.draftId
		? { draft_order: { id: existing.draftId } }
		: await adminFetch<{ draft_order: { id: string } }>("/admin/draft-orders", {
				method: "POST",
				body: JSON.stringify({
					region_id: regionId,
					sales_channel_id: storeConfig.salesChannelId,
					email: input.email.trim(),
					items: input.items.map((item) => ({
						variant_id: item.variantId,
						quantity: 1,
					})),
					shipping_address: address,
					billing_address: address,
					shipping_methods: [
						{
							shipping_option_id: shipping.id,
							name: shipping.name,
							amount: shipping.pricePln,
						},
					],
					metadata,
					no_notification_order: true,
				}),
			});

	const converted = await adminFetch<{ order: { id: string } }>(
		`/admin/draft-orders/${draft.draft_order.id}/convert-to-order`,
		{ method: "POST", body: JSON.stringify({}) },
	);

	if (!converted.order?.id) {
		throw new Error("Zamówienie zostało utworzone, ale nie udało się pobrać jego identyfikatora.");
	}

	return { orderId: converted.order.id };
}
