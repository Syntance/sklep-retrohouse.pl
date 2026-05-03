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
