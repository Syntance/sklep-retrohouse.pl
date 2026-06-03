import "server-only";
import { env } from "@/env";
import { getReturnRequestsByCustomerEmail } from "@/lib/admin/returns";
import {
	type CustomerClaimInfo,
	mapReturnToCustomerClaim,
} from "@/lib/customer/claim-status";
import {
	type CustomerWithdrawalInfo,
	mapReturnToCustomerWithdrawal,
} from "@/lib/customer/withdrawal-status";
import type {
	OrderFulfillmentStatus,
	OrderPaymentStatus,
	OrderStatus,
} from "@/lib/admin/order-types";
import {
	CLAIM_WARRANTY_DAYS,
	WITHDRAWAL_WINDOW_DAYS,
	daysLeftInWindow,
} from "@/lib/customer/order-windows";
import {
	resolveLineItemThumbnailUrl,
	resolveProductThumbnailUrl,
	type MedusaProductMedia,
} from "@/lib/medusa/product-thumbnail";
import { resolveMedusaMediaUrl } from "@/lib/medusa/media-url";

/** Pola Admin API — bez *items brak miniaturek i totali pozycji. */
const CUSTOMER_ORDER_FIELDS = [
	"+email",
	"display_id",
	"created_at",
	"total",
	"shipping_total",
	"status",
	"payment_status",
	"fulfillment_status",
	"*items",
	"*fulfillments",
	"+fulfillments.delivered_at",
	"shipping_methods.name",
	"metadata",
].join(",");

export type { CustomerClaimInfo } from "@/lib/customer/claim-status";
export type { CustomerWithdrawalInfo } from "@/lib/customer/withdrawal-status";

const BASE_URL = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, "");
const PUBLISHABLE_KEY = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

/** Cache dla admin tokena (TTL 24h). W produkcji: Redis / Upstash. */
let adminTokenCache: { token: string; expiresAt: number } | null = null;

/**
 * Loguje się do Medusa Admin API i zwraca JWT token.
 * Token cachowany na 23h (Medusa domyślnie 24h).
 */
async function getAdminToken(): Promise<string> {
	// Sprawdź cache
	if (adminTokenCache && Date.now() < adminTokenCache.expiresAt) {
		return adminTokenCache.token;
	}

	const email = env.MEDUSA_ADMIN_EMAIL;
	const password = env.MEDUSA_ADMIN_PASSWORD;

	if (!email || !password) {
		throw new Error("MEDUSA_ADMIN_EMAIL i MEDUSA_ADMIN_PASSWORD są wymagane");
	}

	const res = await fetch(`${BASE_URL}/auth/user/emailpass`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
		signal: AbortSignal.timeout(10_000),
	});

	if (!res.ok) {
		console.error("[getAdminToken] Failed:", res.status, await res.text());
		throw new Error(`Medusa admin auth failed: ${res.status}`);
	}

	const data = (await res.json()) as { token: string };
	const token = data.token;

	// Cache na 23h
	adminTokenCache = {
		token,
		expiresAt: Date.now() + 23 * 60 * 60 * 1000,
	};

	return token;
}

/**
 * Fetch do Medusa Admin API z automatycznym logowaniem.
 */
async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
	const token = await getAdminToken();
	const headers = new Headers(init.headers);
	headers.set("Authorization", `Bearer ${token}`);
	headers.set("Content-Type", "application/json");

	const res = await fetch(`${BASE_URL}${path}`, {
		...init,
		headers,
		signal: AbortSignal.timeout(10_000),
	});

	if (!res.ok) {
		const text = await res.text();
		console.error(`[adminFetch] ${path} failed:`, res.status, text);
		throw new Error(`Medusa Admin API error: ${res.status}`);
	}

	return res.json() as T;
}

type MedusaOrder = {
	id: string;
	display_id: number;
	email: string;
	created_at: string;
	total: number;
	shipping_total?: number | null;
	currency_code: string;
	shipping_methods?: Array<{ name?: string | null }> | null;
	items?: Array<{
		id: string;
		title?: string | null;
		subtitle?: string | null;
		product_title?: string | null;
		variant_title?: string | null;
		quantity?: number | null;
		unit_price?: number | null;
		total?: number | null;
		subtotal?: number | null;
		thumbnail?: string | null;
		product_handle?: string | null;
	}> | null;
	status?: string;
	fulfillment_status: string;
	payment_status: string;
	fulfillments?: Array<{
		delivered_at?: string | null;
	}>;
	metadata?: Record<string, unknown> | null;
};

/**
 * Kwoty zamówienia (total, unitPrice, lineTotal) w złotówkach PLN — jak Medusa Admin API
 * i panel magazynu (`formatPrice`). Nie grosze; do UI używaj `formatPrice`, nie `formatCurrency`.
 */
export type CustomerOrder = {
	id: string;
	displayId: number;
	createdAt: string;
	total: number;
	shippingTotal: number;
	shippingMethodName: string | null;
	itemCount: number;
	paymentStatus: OrderPaymentStatus;
	/** Etykieta z checkoutu (metadata.payment), np. „BLIK (test)”. */
	paymentMethodLabel: string | null;
	fulfillmentStatus: OrderFulfillmentStatus;
	orderStatus: OrderStatus;
	/** Ostatnia data dostawy z fulfillmentów — jeśli jest. */
	deliveredAt: string | null;
	items: Array<{
		id: string;
		title: string;
		subtitle: string | null;
		quantity: number;
		unitPrice: number;
		lineTotal: number;
		thumbnail: string | null;
	}>;
	/** Odstąpienie — 14 dni od punktu startowego (dostawa lub data zamówienia). */
	canReturn: boolean;
	daysLeftToReturn: number;
	/** Reklamacja — 2 lata od wydania towaru (UPK rozdz. 5a). */
	canClaim: boolean;
	daysLeftToClaim: number;
	/** ISO — dostawa (ostatnia) lub data zamówienia, jeśli brak delivered_at. */
	claimWarrantyStartAt: string;
	/** Reklamacje powiązane z zamówieniem (najnowsze pierwsze). */
	claims: CustomerClaimInfo[];
	/** Trwająca reklamacja — jeśli jest, nie można złożyć kolejnej. */
	activeClaim: CustomerClaimInfo | null;
	/** Odstąpienia powiązane z zamówieniem (najnowsze pierwsze). */
	withdrawals: CustomerWithdrawalInfo[];
	/** Trwające odstąpienie — blokuje reklamację. */
	activeWithdrawal: CustomerWithdrawalInfo | null;
};

/**
 * Pobiera zamówienia dla danego emaila z Medusa Admin API.
 * BEZPIECZEŃSTWO: email pochodzi z zweryfikowanego tokena OTP.
 * @param email email klienta (z verifyCustomerToken)
 * @returns lista zamówień z możliwością zwrotu
 */
export async function getCustomerOrders(email: string): Promise<CustomerOrder[]> {
	console.log(`[getCustomerOrders] Fetching orders for email: ${email}`);
	
	try {
		// Pobierz zamówienia z Admin API filtrowane po emailu
		// CRITICAL: fields=+email MUSI być w query - bez tego Medusa nie zwraca pola email!
		const response = await adminFetch<{ orders: MedusaOrder[]; count: number }>(
			`/admin/orders?email=${encodeURIComponent(email)}&limit=50&fields=${CUSTOMER_ORDER_FIELDS}`,
		);

		console.log(`[getCustomerOrders] API returned ${response.orders.length} orders`);

		// CRITICAL SECURITY: Zawsze filtruj po stronie aplikacji, nawet jeśli API ma parametr email
		// (defense in depth - API może ignorować parametr lub mieć bug)
		const filteredOrders = response.orders.filter(
			(order) => order.email.toLowerCase() === email.toLowerCase()
		);

		console.log(`[getCustomerOrders] After filtering: ${filteredOrders.length} orders for ${email}`);

		const customerReturns = await getReturnRequestsByCustomerEmail(email);
		const claimsByOrderId = new Map<string, CustomerClaimInfo[]>();
		const withdrawalsByOrderId = new Map<string, CustomerWithdrawalInfo[]>();

		for (const ret of customerReturns) {
			if (ret.requestType === "claim") {
				const info = mapReturnToCustomerClaim(ret);
				const list = claimsByOrderId.get(ret.orderId) ?? [];
				list.push(info);
				claimsByOrderId.set(ret.orderId, list);
			} else {
				const info = mapReturnToCustomerWithdrawal(ret);
				const list = withdrawalsByOrderId.get(ret.orderId) ?? [];
				list.push(info);
				withdrawalsByOrderId.set(ret.orderId, list);
			}
		}

		const sortByUpdated = <T extends { updatedAt: string }>(list: T[]) =>
			list.sort(
				(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
			);

		for (const list of claimsByOrderId.values()) sortByUpdated(list);
		for (const list of withdrawalsByOrderId.values()) sortByUpdated(list);

		const now = Date.now();
		const thumbsByHandle = await fetchProductThumbnailsByHandles(
			filteredOrders.flatMap((order) =>
				(order.items ?? [])
					.map((item) => item.product_handle?.trim())
					.filter((handle): handle is string => Boolean(handle)),
			),
		);

		return filteredOrders.map((order) => {
			const warrantyStartAt = resolveClaimWarrantyStartAt(order);
			const daysLeftReturn = daysLeftInWindow(
				warrantyStartAt,
				WITHDRAWAL_WINDOW_DAYS,
				now,
			);
			const daysLeftClaim = daysLeftInWindow(warrantyStartAt, CLAIM_WARRANTY_DAYS, now);
			const claims = claimsByOrderId.get(order.id) ?? [];
			const activeClaim = claims.find((c) => c.isActive) ?? null;
			const withdrawals = withdrawalsByOrderId.get(order.id) ?? [];
			const activeWithdrawal = withdrawals.find((w) => w.isActive) ?? null;

			const orderStatus = parseOrderStatus(order.status);
			const paymentStatus = parsePaymentStatus(order.payment_status);
			const fulfillmentStatus = parseFulfillmentStatus(order.fulfillment_status);

			return {
				id: order.id,
				displayId: order.display_id,
				createdAt: order.created_at,
				total: coerceOrderAmount(order.total),
				shippingTotal: coerceOrderAmount(order.shipping_total),
				shippingMethodName: order.shipping_methods?.[0]?.name ?? null,
				itemCount: (order.items ?? []).length,
				paymentStatus,
				paymentMethodLabel: parsePaymentMethodLabel(order.metadata),
				fulfillmentStatus,
				orderStatus,
				deliveredAt: resolveDeliveredAt(order),
				items: (order.items ?? []).map((item) => {
					const unitPrice = coerceOrderAmount(item.unit_price);
					const quantity = item.quantity ?? 0;
					const handle = item.product_handle?.trim() ?? "";
					const productThumb = handle ? thumbsByHandle.get(handle) : null;
					return {
						id: item.id,
						title: item.title ?? item.product_title ?? "Produkt",
						subtitle: item.variant_title ?? item.subtitle ?? null,
						quantity,
						unitPrice,
						lineTotal: resolveLineItemTotal({ unitPrice, quantity, item }),
						thumbnail: resolveLineItemThumbnailUrl(item.thumbnail, productThumb),
					};
				}),
				canReturn: daysLeftReturn > 0,
				daysLeftToReturn: daysLeftReturn,
				canClaim: daysLeftClaim > 0,
				daysLeftToClaim: daysLeftClaim,
				claimWarrantyStartAt: warrantyStartAt,
				claims,
				activeClaim,
				withdrawals,
				activeWithdrawal,
			};
		});
	} catch (error) {
		console.error("[getCustomerOrders] Error fetching orders:", error);
		// W przypadku błędu zwróć pustą listę zamiast crashować całą stronę
		return [];
	}
}

/**
 * Pobiera jedno zamówienie klienta (po ID) — tylko jeśli należy do emaila z tokenu.
 */
const ORDER_STATUSES = new Set<OrderStatus>([
	"pending",
	"completed",
	"draft",
	"archived",
	"canceled",
	"requires_action",
]);

const PAYMENT_STATUSES = new Set<OrderPaymentStatus>([
	"not_paid",
	"awaiting",
	"authorized",
	"partially_authorized",
	"captured",
	"partially_captured",
	"refunded",
	"partially_refunded",
	"canceled",
	"requires_action",
]);

const FULFILLMENT_STATUSES = new Set<OrderFulfillmentStatus>([
	"not_fulfilled",
	"partially_fulfilled",
	"fulfilled",
	"partially_shipped",
	"shipped",
	"partially_delivered",
	"delivered",
	"canceled",
]);

type MedusaProductWithHandle = MedusaProductMedia & { handle?: string | null };

async function fetchProductThumbnailsByHandles(handles: string[]): Promise<Map<string, string>> {
	const map = new Map<string, string>();
	const unique = [...new Set(handles)];
	if (unique.length === 0) return map;

	await Promise.all(
		unique.map(async (handle) => {
			try {
				const { products } = await adminFetch<{ products: MedusaProductWithHandle[] }>(
					`/admin/products?handle=${encodeURIComponent(handle)}&limit=1&fields=handle,thumbnail,images.url`,
				);
				const product = products[0];
				const thumb = product ? resolveProductThumbnailUrl(product) : null;
				if (thumb) map.set(handle, thumb);
			} catch {
				// pojedynczy produkt nie blokuje listy zamówień
			}
		}),
	);
	return map;
}

function parsePaymentMethodLabel(
	metadata: Record<string, unknown> | null | undefined,
): string | null {
	const payment = metadata?.payment;
	if (typeof payment === "string" && payment.trim().length > 0) {
		return payment.trim();
	}
	return null;
}

/** Medusa Admin order API — kwoty w złotówkach (np. 9 = 9 PLN), nie w groszach. */
function coerceOrderAmount(value: unknown): number {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	if (value && typeof value === "object") {
		const record = value as Record<string, unknown>;
		for (const key of ["numeric", "value", "amount"] as const) {
			const candidate = record[key];
			if (typeof candidate === "number" && Number.isFinite(candidate)) {
				return candidate;
			}
		}
	}
	return 0;
}

function resolveLineItemTotal({
	unitPrice,
	quantity,
	item,
}: {
	unitPrice: number;
	quantity: number;
	item: { total?: unknown; subtotal?: unknown };
}): number {
	if (item.total != null) {
		const total = coerceOrderAmount(item.total);
		if (Number.isFinite(total)) return total;
	}
	if (item.subtotal != null) {
		const subtotal = coerceOrderAmount(item.subtotal);
		if (Number.isFinite(subtotal)) return subtotal;
	}
	return unitPrice * quantity;
}

function parseOrderStatus(value: string | undefined): OrderStatus {
	if (value !== undefined && ORDER_STATUSES.has(value as OrderStatus)) {
		return value as OrderStatus;
	}
	return "pending";
}

function parsePaymentStatus(value: string): OrderPaymentStatus {
	if (PAYMENT_STATUSES.has(value as OrderPaymentStatus)) {
		return value as OrderPaymentStatus;
	}
	return "awaiting";
}

function parseFulfillmentStatus(value: string): OrderFulfillmentStatus {
	if (FULFILLMENT_STATUSES.has(value as OrderFulfillmentStatus)) {
		return value as OrderFulfillmentStatus;
	}
	return "not_fulfilled";
}

function resolveDeliveredAt(order: MedusaOrder): string | null {
	const deliveredAt = (order.fulfillments ?? [])
		.map((f) => f.delivered_at)
		.filter((value): value is string => Boolean(value))
		.map((value) => new Date(value).getTime());

	if (deliveredAt.length === 0) return null;
	return new Date(Math.max(...deliveredAt)).toISOString();
}

/** Punkt startowy gwarancji reklamacji: ostatnia dostawa, inaczej data zamówienia. */
function resolveClaimWarrantyStartAt(order: MedusaOrder): string {
	const deliveredAt = (order.fulfillments ?? [])
		.map((f) => f.delivered_at)
		.filter((value): value is string => Boolean(value))
		.map((value) => new Date(value).getTime());

	if (deliveredAt.length > 0) {
		const latest = Math.max(...deliveredAt);
		return new Date(latest).toISOString();
	}

	return order.created_at;
}

export async function getCustomerOrderById(
	email: string,
	orderId: string,
): Promise<CustomerOrder | null> {
	const orders = await getCustomerOrders(email);
	return orders.find((order) => order.id === orderId) ?? null;
}
