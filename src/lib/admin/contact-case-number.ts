import "server-only";

import { catalogAdminMutate, catalogAdminFetch } from "./medusa-admin";

const COUNTER_KEY = "contact_case_counter";
const YEAR_KEY = "contact_case_year";

type MedusaStore = {
	id: string;
	metadata?: Record<string, unknown> | null;
};

const STORE_READ_PATH = "/admin/stores?limit=1&fields=id,metadata";

/** Numer sprawy formularza kontaktowego: FK-2026-00042 */
export async function allocateContactCaseNumber(): Promise<string> {
	const data = await catalogAdminFetch<{ stores: MedusaStore[] }>(STORE_READ_PATH);
	const store = data?.stores[0];
	if (!store) {
		throw new Error(
			"Brak konta serwisowego Medusa (MEDUSA_ADMIN_EMAIL / MEDUSA_ADMIN_PASSWORD) do nadania numeru sprawy.",
		);
	}

	const meta = store.metadata ?? {};
	const year = new Date().getFullYear();
	const storedYear = Number(meta[YEAR_KEY]) || 0;
	let counter = Number(meta[COUNTER_KEY]) || 0;

	if (storedYear !== year) {
		counter = 0;
	}
	counter += 1;

	const updated = await catalogAdminMutate(`/admin/stores/${store.id}`, {
		method: "POST",
		body: JSON.stringify({
			metadata: {
				...meta,
				[YEAR_KEY]: year,
				[COUNTER_KEY]: counter,
			},
		}),
	});
	if (!updated) {
		throw new Error("Nie udało się zapisać licznika numerów spraw w Medusa.");
	}

	return `FK-${year}-${String(counter).padStart(5, "0")}`;
}
