import "server-only";

import { adminFetch } from "./medusa-admin";

const COUNTER_KEY = "contact_case_counter";
const YEAR_KEY = "contact_case_year";

type MedusaStore = {
	id: string;
	metadata?: Record<string, unknown> | null;
};

async function getStore(): Promise<MedusaStore> {
	const data = await adminFetch<{ stores: MedusaStore[] }>("/admin/stores?limit=1&fields=id,metadata");
	const store = data.stores[0];
	if (!store) throw new Error("Nie znaleziono sklepu w Medusa.");
	return store;
}

/** Numer sprawy formularza kontaktowego: FK-2026-00042 */
export async function allocateContactCaseNumber(): Promise<string> {
	const store = await getStore();
	const meta = store.metadata ?? {};
	const year = new Date().getFullYear();
	const storedYear = Number(meta[YEAR_KEY]) || 0;
	let counter = Number(meta[COUNTER_KEY]) || 0;

	if (storedYear !== year) {
		counter = 0;
	}
	counter += 1;

	await adminFetch(`/admin/stores/${store.id}`, {
		method: "POST",
		body: JSON.stringify({
			metadata: {
				...meta,
				[YEAR_KEY]: year,
				[COUNTER_KEY]: counter,
			},
		}),
	});

	return `FK-${year}-${String(counter).padStart(5, "0")}`;
}
