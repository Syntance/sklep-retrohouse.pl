const PRICE_FORMATTER = new Intl.NumberFormat("pl-PL", {
	style: "currency",
	currency: "PLN",
	maximumFractionDigits: 0,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("pl-PL", {
	day: "numeric",
	month: "long",
	year: "numeric",
});

export function formatPrice(value: number): string {
	return PRICE_FORMATTER.format(value);
}

export function formatDate(value: Date | string): string {
	const date = typeof value === "string" ? new Date(value) : value;
	return DATE_FORMATTER.format(date);
}

/**
 * Liczba pełnych dni od podanej daty do dziś. Używamy do dynamicznych
 * badge'y typu "Świeża dostawa" (PDP, jeśli `daysSince(addedAt) < 14`).
 *
 * Tolerancyjna na string ISO i Date. Bez timezone gymnastyki — różnice
 * < 1 dnia traktujemy jako 0, co odpowiada wymogowi "świeża < 14 dni".
 */
export function daysSince(value: Date | string): number {
	const then = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(then.getTime())) return Number.POSITIVE_INFINITY;
	const diffMs = Date.now() - then.getTime();
	return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
