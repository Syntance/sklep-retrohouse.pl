import "server-only";
import { env } from "@/env";

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
	currency_code: string;
	items: Array<{
		id: string;
		title: string;
		subtitle: string | null;
		quantity: number;
		unit_price: number;
		total: number;
		thumbnail: string | null;
	}>;
	fulfillment_status: string;
	payment_status: string;
};

export type CustomerOrder = {
	id: string;
	displayId: number;
	createdAt: string;
	total: number;
	itemCount: number;
	items: Array<{
		id: string;
		title: string;
		quantity: number;
		unitPrice: number;
		thumbnail: string | null;
	}>;
	canReturn: boolean; // true jeśli < 14 dni od created_at
	daysLeftToReturn: number; // ile dni zostało (0 jeśli > 14)
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
		const response = await adminFetch<{ orders: MedusaOrder[]; count: number }>(
			`/admin/orders?email=${encodeURIComponent(email)}&limit=50`
		);

		console.log(`[getCustomerOrders] API returned ${response.orders.length} orders`);

		// CRITICAL SECURITY: Zawsze filtruj po stronie aplikacji, nawet jeśli API ma parametr email
		// (defense in depth - API może ignorować parametr lub mieć bug)
		const filteredOrders = response.orders.filter(
			(order) => order.email.toLowerCase() === email.toLowerCase()
		);

		console.log(`[getCustomerOrders] After filtering: ${filteredOrders.length} orders for ${email}`);

		const now = Date.now();
		return filteredOrders.map((order) => {
			const createdMs = new Date(order.created_at).getTime();
			const ageMs = now - createdMs;
			const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
			const daysLeft = Math.max(0, 14 - ageDays);

			return {
				id: order.id,
				displayId: order.display_id,
				createdAt: order.created_at,
				total: order.total,
				itemCount: order.items.length,
				items: order.items.map((item) => ({
					id: item.id,
					title: item.title,
					quantity: item.quantity,
					unitPrice: item.unit_price,
					thumbnail: item.thumbnail,
				})),
				canReturn: daysLeft > 0,
				daysLeftToReturn: daysLeft,
			};
		});
	} catch (error) {
		console.error("[getCustomerOrders] Error fetching orders:", error);
		// W przypadku błędu zwróć pustą listę zamiast crashować całą stronę
		return [];
	}
}
