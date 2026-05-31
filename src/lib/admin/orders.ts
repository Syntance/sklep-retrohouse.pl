import "server-only";
import { resolveMedusaMediaUrl } from "@/lib/medusa/media-url";
import { adminFetch } from "./medusa-admin";

/** Status realizacji zamówienia w Medusa (cykl życia). */
export type OrderStatus =
	| "pending"
	| "completed"
	| "draft"
	| "archived"
	| "canceled"
	| "requires_action";

/** Status płatności w Medusa. */
export type OrderPaymentStatus =
	| "not_paid"
	| "awaiting"
	| "authorized"
	| "partially_authorized"
	| "captured"
	| "partially_captured"
	| "refunded"
	| "partially_refunded"
	| "canceled"
	| "requires_action";

/** Status wysyłki w Medusa. */
export type OrderFulfillmentStatus =
	| "not_fulfilled"
	| "partially_fulfilled"
	| "fulfilled"
	| "partially_shipped"
	| "shipped"
	| "partially_delivered"
	| "delivered"
	| "canceled";

export type OrderAddress = {
	firstName: string;
	lastName: string;
	company: string;
	address1: string;
	address2: string;
	city: string;
	postalCode: string;
	province: string;
	countryCode: string;
	phone: string;
};

export type OrderLineItem = {
	id: string;
	title: string;
	subtitle: string;
	quantity: number;
	unitPrice: number;
	total: number;
	thumbnail: string | null;
};

export type OrderPayment = {
	id: string;
	amount: number;
	currencyCode: string;
	capturedAt: string | null;
	canceledAt: string | null;
};

export type OrderFulfillment = {
	id: string;
	shippedAt: string | null;
	deliveredAt: string | null;
	canceledAt: string | null;
	items: Array<{ id: string; quantity: number }>;
};

export type AdminOrderRow = {
	id: string;
	displayId: number;
	status: OrderStatus;
	paymentStatus: OrderPaymentStatus;
	fulfillmentStatus: OrderFulfillmentStatus;
	email: string;
	customerName: string;
	currencyCode: string;
	total: number;
	itemCount: number;
	createdAt: string;
};

export type AdminOrderDetail = {
	id: string;
	displayId: number;
	status: OrderStatus;
	paymentStatus: OrderPaymentStatus;
	fulfillmentStatus: OrderFulfillmentStatus;
	email: string;
	phone: string;
	currencyCode: string;
	createdAt: string;
	updatedAt: string;
	items: OrderLineItem[];
	itemTotal: number;
	shippingTotal: number;
	taxTotal: number;
	discountTotal: number;
	total: number;
	shippingAddress: OrderAddress | null;
	billingAddress: OrderAddress | null;
	shippingMethodName: string | null;
	payments: OrderPayment[];
	fulfillments: OrderFulfillment[];
	/** Dane z metadata zamówienia (np. faktura, wybrana płatność ze sklepu). */
	metadata: Record<string, string>;
};

type MedusaAddress = {
	first_name?: string | null;
	last_name?: string | null;
	company?: string | null;
	address_1?: string | null;
	address_2?: string | null;
	city?: string | null;
	postal_code?: string | null;
	province?: string | null;
	country_code?: string | null;
	phone?: string | null;
};

type MedusaOrderItem = {
	id: string;
	title?: string | null;
	subtitle?: string | null;
	product_title?: string | null;
	variant_title?: string | null;
	quantity?: number | null;
	unit_price?: number | null;
	total?: number | null;
	thumbnail?: string | null;
};

type MedusaPayment = {
	id: string;
	amount?: number | null;
	currency_code?: string | null;
	captured_at?: string | null;
	canceled_at?: string | null;
};

type MedusaFulfillment = {
	id: string;
	shipped_at?: string | null;
	delivered_at?: string | null;
	canceled_at?: string | null;
	items?: Array<{ id?: string | null; line_item_id?: string | null; quantity?: number | null }> | null;
};

type MedusaOrder = {
	id: string;
	display_id?: number | null;
	status?: OrderStatus | null;
	payment_status?: OrderPaymentStatus | null;
	fulfillment_status?: OrderFulfillmentStatus | null;
	email?: string | null;
	currency_code?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
	total?: number | null;
	item_total?: number | null;
	shipping_total?: number | null;
	tax_total?: number | null;
	discount_total?: number | null;
	metadata?: Record<string, unknown> | null;
	items?: MedusaOrderItem[] | null;
	shipping_address?: MedusaAddress | null;
	billing_address?: MedusaAddress | null;
	shipping_methods?: Array<{ name?: string | null; shipping_option_id?: string | null }> | null;
	payment_collections?: Array<{ payments?: MedusaPayment[] | null }> | null;
	fulfillments?: MedusaFulfillment[] | null;
};

function mapAddress(address: MedusaAddress | null | undefined): OrderAddress | null {
	if (!address) return null;
	const hasData =
		address.first_name || address.last_name || address.address_1 || address.city || address.phone;
	if (!hasData) return null;
	return {
		firstName: address.first_name ?? "",
		lastName: address.last_name ?? "",
		company: address.company ?? "",
		address1: address.address_1 ?? "",
		address2: address.address_2 ?? "",
		city: address.city ?? "",
		postalCode: address.postal_code ?? "",
		province: address.province ?? "",
		countryCode: address.country_code ?? "",
		phone: address.phone ?? "",
	};
}

function customerNameFrom(order: MedusaOrder): string {
	const address = order.shipping_address ?? order.billing_address;
	const parts = [address?.first_name, address?.last_name].filter(Boolean);
	return parts.join(" ").trim();
}

function normalizeMetadata(metadata: Record<string, unknown> | null | undefined): Record<string, string> {
	const result: Record<string, string> = {};
	for (const [key, value] of Object.entries(metadata ?? {})) {
		if (value == null) continue;
		result[key] = typeof value === "string" ? value : JSON.stringify(value);
	}
	return result;
}

const LIST_FIELDS = [
	"id",
	"display_id",
	"status",
	"payment_status",
	"fulfillment_status",
	"email",
	"currency_code",
	"total",
	"created_at",
	"items.quantity",
	"shipping_address.first_name",
	"shipping_address.last_name",
	"billing_address.first_name",
	"billing_address.last_name",
].join(",");

const DETAIL_FIELDS = [
	"id",
	"display_id",
	"status",
	"payment_status",
	"fulfillment_status",
	"email",
	"currency_code",
	"created_at",
	"updated_at",
	"total",
	"item_total",
	"shipping_total",
	"tax_total",
	"discount_total",
	"metadata",
	"*items",
	"*shipping_address",
	"*billing_address",
	"shipping_methods.name",
	"shipping_methods.shipping_option_id",
	"*payment_collections.payments",
	"*fulfillments",
].join(",");

export async function listAdminOrders(): Promise<AdminOrderRow[]> {
	const data = await adminFetch<{ orders: MedusaOrder[] }>(
		`/admin/orders?limit=100&order=-created_at&fields=${LIST_FIELDS}`,
	);

	return data.orders.map((order) => ({
		id: order.id,
		displayId: order.display_id ?? 0,
		status: order.status ?? "pending",
		paymentStatus: order.payment_status ?? "not_paid",
		fulfillmentStatus: order.fulfillment_status ?? "not_fulfilled",
		email: order.email ?? "",
		customerName: customerNameFrom(order),
		currencyCode: (order.currency_code ?? "pln").toUpperCase(),
		total: order.total ?? 0,
		itemCount: (order.items ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0),
		createdAt: order.created_at ?? "",
	}));
}

export async function getAdminOrder(id: string): Promise<AdminOrderDetail | null> {
	const data = await adminFetch<{ order: MedusaOrder }>(
		`/admin/orders/${id}?fields=${DETAIL_FIELDS}`,
	);
	const order = data.order;
	if (!order) return null;

	const payments: OrderPayment[] = (order.payment_collections ?? []).flatMap((collection) =>
		(collection.payments ?? []).map((payment) => ({
			id: payment.id,
			amount: payment.amount ?? 0,
			currencyCode: (payment.currency_code ?? order.currency_code ?? "pln").toUpperCase(),
			capturedAt: payment.captured_at ?? null,
			canceledAt: payment.canceled_at ?? null,
		})),
	);

	const fulfillments: OrderFulfillment[] = (order.fulfillments ?? []).map((fulfillment) => ({
		id: fulfillment.id,
		shippedAt: fulfillment.shipped_at ?? null,
		deliveredAt: fulfillment.delivered_at ?? null,
		canceledAt: fulfillment.canceled_at ?? null,
		items: (fulfillment.items ?? []).map((item) => ({
			id: item.id ?? "",
			quantity: item.quantity ?? 0,
		})),
	}));

	return {
		id: order.id,
		displayId: order.display_id ?? 0,
		status: order.status ?? "pending",
		paymentStatus: order.payment_status ?? "not_paid",
		fulfillmentStatus: order.fulfillment_status ?? "not_fulfilled",
		email: order.email ?? "",
		phone: order.shipping_address?.phone ?? order.billing_address?.phone ?? "",
		currencyCode: (order.currency_code ?? "pln").toUpperCase(),
		createdAt: order.created_at ?? "",
		updatedAt: order.updated_at ?? "",
		items: (order.items ?? []).map((item) => ({
			id: item.id,
			title: item.title ?? item.product_title ?? "Produkt",
			subtitle: item.variant_title ?? item.subtitle ?? "",
			quantity: item.quantity ?? 0,
			unitPrice: item.unit_price ?? 0,
			total: item.total ?? 0,
			thumbnail: resolveMedusaMediaUrl(item.thumbnail) ?? null,
		})),
		itemTotal: order.item_total ?? 0,
		shippingTotal: order.shipping_total ?? 0,
		taxTotal: order.tax_total ?? 0,
		discountTotal: order.discount_total ?? 0,
		total: order.total ?? 0,
		shippingAddress: mapAddress(order.shipping_address),
		billingAddress: mapAddress(order.billing_address),
		shippingMethodName: order.shipping_methods?.[0]?.name ?? null,
		payments,
		fulfillments,
		metadata: normalizeMetadata(order.metadata),
	};
}

/** Zaksięgowanie (capture) płatności, której jeszcze nie pobrano. */
export async function captureOrderPayment(orderId: string): Promise<void> {
	const order = await getAdminOrder(orderId);
	if (!order) throw new Error("Nie znaleziono zamówienia.");

	const pending = order.payments.find((p) => !p.capturedAt && !p.canceledAt);
	if (!pending) throw new Error("Brak płatności do zaksięgowania.");

	await adminFetch(`/admin/payments/${pending.id}/capture`, {
		method: "POST",
		body: JSON.stringify({}),
	});
}

type MedusaOrderRaw = {
	items?: Array<{ id: string; quantity?: number | null; detail?: { fulfilled_quantity?: number | null } | null }> | null;
	shipping_methods?: Array<{ shipping_option_id?: string | null }> | null;
};

/** Utworzenie wysyłki (fulfillment) dla wszystkich niezrealizowanych pozycji. */
export async function fulfillOrder(orderId: string): Promise<void> {
	const data = await adminFetch<{ order: MedusaOrderRaw }>(
		`/admin/orders/${orderId}?fields=id,items.id,items.quantity,items.detail.fulfilled_quantity,shipping_methods.shipping_option_id`,
	);
	const order = data.order;

	const items = (order.items ?? [])
		.map((item) => {
			const fulfilled = item.detail?.fulfilled_quantity ?? 0;
			const remaining = (item.quantity ?? 0) - fulfilled;
			return { id: item.id, quantity: remaining };
		})
		.filter((item) => item.quantity > 0);

	if (items.length === 0) throw new Error("Wszystkie pozycje są już zrealizowane.");

	const body: Record<string, unknown> = { items };
	const shippingOptionId = order.shipping_methods?.[0]?.shipping_option_id;
	if (shippingOptionId) body.shipping_option_id = shippingOptionId;

	const locations = await adminFetch<{ stock_locations: Array<{ id: string }> }>(
		"/admin/stock-locations?limit=1",
	);
	const locationId = locations.stock_locations[0]?.id;
	if (locationId) body.location_id = locationId;

	await adminFetch(`/admin/orders/${orderId}/fulfillments`, {
		method: "POST",
		body: JSON.stringify(body),
	});
}

/** Oznaczenie najnowszej wysyłki jako nadanej (shipment). */
export async function markOrderShipped(orderId: string): Promise<void> {
	const order = await getAdminOrder(orderId);
	if (!order) throw new Error("Nie znaleziono zamówienia.");

	const fulfillment = order.fulfillments
		.filter((f) => !f.canceledAt && !f.shippedAt)
		.at(-1);
	if (!fulfillment) throw new Error("Najpierw utwórz realizację (fulfillment).");

	const items = fulfillment.items
		.filter((item) => item.id && item.quantity > 0)
		.map((item) => ({ id: item.id, quantity: item.quantity }));
	if (items.length === 0) throw new Error("Brak pozycji do nadania.");

	await adminFetch(`/admin/orders/${orderId}/fulfillments/${fulfillment.id}/shipments`, {
		method: "POST",
		body: JSON.stringify({ items }),
	});
}

/** Oznaczenie wysyłki jako dostarczonej. */
export async function markOrderDelivered(orderId: string): Promise<void> {
	const order = await getAdminOrder(orderId);
	if (!order) throw new Error("Nie znaleziono zamówienia.");

	const fulfillment = order.fulfillments
		.filter((f) => !f.canceledAt && !f.deliveredAt)
		.at(-1);
	if (!fulfillment) throw new Error("Brak realizacji do oznaczenia jako dostarczona.");

	await adminFetch(
		`/admin/orders/${orderId}/fulfillments/${fulfillment.id}/mark-as-delivered`,
		{ method: "POST", body: JSON.stringify({}) },
	);
}

export async function cancelOrder(orderId: string): Promise<void> {
	await adminFetch(`/admin/orders/${orderId}/cancel`, {
		method: "POST",
		body: JSON.stringify({ no_notification: false }),
	});
}

export async function completeOrder(orderId: string): Promise<void> {
	await adminFetch(`/admin/orders/${orderId}/complete`, {
		method: "POST",
		body: JSON.stringify({}),
	});
}

export async function archiveOrder(orderId: string): Promise<void> {
	await adminFetch(`/admin/orders/${orderId}/archive`, {
		method: "POST",
		body: JSON.stringify({}),
	});
}
