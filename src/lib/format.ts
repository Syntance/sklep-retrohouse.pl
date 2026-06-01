const DATE_FORMATTER = new Intl.DateTimeFormat("pl-PL", {
	day: "numeric",
	month: "long",
	year: "numeric",
});

export function formatPrice(value: number, currencyCode = "PLN"): string {
	return new Intl.NumberFormat("pl-PL", {
		style: "currency",
		currency: currencyCode.toUpperCase(),
		maximumFractionDigits: currencyCode.toUpperCase() === "PLN" ? 0 : 2,
	}).format(value);
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

/**
 * Formatuje kwotę w groszach na walutę (np. 10000 groszy → "100,00 zł").
 * Używane w systemie zwrotów — Medusa przechowuje ceny jako integer grosze.
 */
export function formatCurrency(amountInCents: number, currencyCode = "PLN"): string {
	return new Intl.NumberFormat("pl-PL", {
		style: "currency",
		currency: currencyCode.toUpperCase(),
	}).format(amountInCents / 100);
}
