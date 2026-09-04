import "server-only";
import {
	DEFAULT_EPOCH_OPTIONS,
	type EpochOption,
	parseEpochsJson,
} from "@/lib/products/epoch-types";
import { adminFetch } from "./medusa-admin";

const METADATA_KEY = "epochs";

export type AdminEpoch = EpochOption & {
	productCount: number;
};

type MedusaStore = {
	id: string;
	metadata?: Record<string, unknown> | null;
};

async function getStore(): Promise<MedusaStore> {
	const data = await adminFetch<{ stores: MedusaStore[] }>(
		"/admin/stores?limit=1&fields=id,metadata",
	);
	const store = data.stores[0];
	if (!store) throw new Error("Nie znaleziono sklepu w Medusa.");
	return store;
}

async function readEpochOptionsFromStore(): Promise<EpochOption[]> {
	const store = await getStore();
	const raw = store.metadata?.[METADATA_KEY];
	const parsed = parseEpochsJson(typeof raw === "string" ? raw : undefined);
	return parsed ?? DEFAULT_EPOCH_OPTIONS;
}

async function writeEpochOptionsToStore(epochs: EpochOption[]): Promise<void> {
	const store = await getStore();
	await adminFetch(`/admin/stores/${store.id}`, {
		method: "POST",
		body: JSON.stringify({
			metadata: {
				...(store.metadata ?? {}),
				[METADATA_KEY]: JSON.stringify(epochs),
			},
		}),
	});
}

async function productCountByEpoch(): Promise<Map<string, number>> {
	const data = await adminFetch<{
		products: Array<{ metadata?: Record<string, unknown> | null }>;
	}>("/admin/products?limit=200&fields=metadata");

	const counts = new Map<string, number>();
	for (const product of data.products) {
		const epoch = product.metadata?.epoch;
		if (typeof epoch === "string" && epoch.trim()) {
			const key = epoch.trim();
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
	}
	return counts;
}

/** Lista epok z liczbą produktów — do panelu /magazyn/epoki. */
export async function listEpochs(): Promise<AdminEpoch[]> {
	const epochs = await readEpochOptionsFromStore();
	const counts = await productCountByEpoch();
	return epochs.map((epoch) => ({
		...epoch,
		productCount: counts.get(epoch.value) ?? 0,
	}));
}

type EpochInput = {
	value: string;
	label: string;
};

async function saveEpochs(epochs: EpochInput[]): Promise<void> {
	const normalized = epochs
		.map((epoch) => ({
			value: epoch.value.trim(),
			label: epoch.label.trim(),
		}))
		.filter((epoch) => epoch.value.length > 0 && epoch.label.length > 0);

	if (normalized.length === 0) {
		throw new Error("Lista epok nie może być pusta.");
	}

	const values = new Set<string>();
	for (const epoch of normalized) {
		if (values.has(epoch.value)) {
			throw new Error(`Duplikat epoki: ${epoch.value}`);
		}
		values.add(epoch.value);
	}

	await writeEpochOptionsToStore(normalized);
}

export async function upsertEpoch(input: EpochInput, previousValue?: string): Promise<void> {
	const value = input.value.trim();
	const label = input.label.trim();
	if (!value || !label) throw new Error("Podaj nazwę i adres epoki.");

	const epochs = await readEpochOptionsFromStore();
	const without = previousValue
		? epochs.filter((epoch) => epoch.value !== previousValue)
		: epochs.filter((epoch) => epoch.value !== value);

	if (without.some((epoch) => epoch.value === value) && previousValue !== value) {
		throw new Error("Epoka o tym adresie już istnieje.");
	}

	const next = [...without, { value, label }].sort((a, b) => a.label.localeCompare(b.label, "pl"));
	await saveEpochs(next);
}

export async function deleteEpoch(value: string): Promise<void> {
	const epochs = await readEpochOptionsFromStore();
	if (epochs.length <= 1) throw new Error("Musi zostać co najmniej jedna epoka.");
	if (!epochs.some((epoch) => epoch.value === value)) throw new Error("Nie znaleziono epoki.");
	await saveEpochs(epochs.filter((epoch) => epoch.value !== value));
}

/** Odczyt konfiguracji epok (admin + storefront). */
export async function getConfiguredEpochs(): Promise<EpochOption[]> {
	return readEpochOptionsFromStore();
}
