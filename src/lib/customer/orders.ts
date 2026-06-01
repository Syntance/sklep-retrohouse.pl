import "server-only";
import { env } from "@/env";

const BASE_URL = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, "");
const PUBLISHABLE_KEY = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

async function storeFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
	const headers = new Headers(init.headers);
	headers.set("x-publishable-api-key", PUBLISHABLE_KEY ?? "");

	const res = await fetch(`${BASE_URL}${path}`, {
		...init,
		headers,
		cache: "no-store",
		signal: AbortSignal.timeout(10_000),
	});

	if (!res.ok) {
		throw new Error(`Medusa API error: ${res.status}`);
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
 * Pobiera zamówienia dla danego emaila z Medusa.
 * @param email email klienta
 * @returns lista zamówień
 */
export async function getCustomerOrders(email: string): Promise<CustomerOrder[]> {
	// Medusa nie ma publicznego endpoint dla "orders by email" — trzeba użyć admin API
	// lub przechowywać mapping email → order IDs po stronie Next.js.
	// Na potrzeby prototypu: mock data (w produkcji: admin API + cache).
	
	// TODO: Zaimplementuj pobieranie przez Medusa Admin API lub własną bazę
	// const response = await storeFetch<{ orders: MedusaOrder[] }>(
	// 	`/admin/orders?email=${encodeURIComponent(email)}`
	// );

	// Mock dla prototypu:
	const mockOrders: MedusaOrder[] = [];

	const now = Date.now();
	return mockOrders.map((order) => {
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
}
