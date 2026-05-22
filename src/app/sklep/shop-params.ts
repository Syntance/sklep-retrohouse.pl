export type ShopSearchParams = {
	kategoria?: string;
	cenaOd?: string;
	cenaDo?: string;
	epoka?: string;
	sort?: string;
};

export function parsePriceParam(value: string | undefined): number | undefined {
	if (!value?.trim()) return undefined;
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed < 0) return undefined;
	return parsed;
}

export function normalizePriceRange(
	min?: number,
	max?: number,
): { min?: number; max?: number } {
	if (min !== undefined && max !== undefined && min > max) {
		return { min: max, max: min };
	}
	return { min, max };
}

export function mergeShopParams(
	current: ShopSearchParams,
	next: Partial<ShopSearchParams>,
): string {
	const result = { ...current, ...next };
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(result)) {
		if (value && typeof value === "string") search.set(key, value);
	}
	const stringified = search.toString();
	return stringified ? `?${stringified}` : "";
}
