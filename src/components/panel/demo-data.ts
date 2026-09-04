/** Grosze → PLN (UI). */
export function formatKwota(grosze: number): string {
	return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(
		grosze / 100,
	);
}

export function moduleBadgeFromHref(
	href: string,
	badges?: Record<string, string>,
): string | undefined {
	const segment = href.split("/").filter(Boolean).at(-1);
	if (!segment || !badges) return undefined;
	return badges[segment];
}

export function buildOverviewModuleBadges(input: {
	openOrders: number;
	pendingReturns?: number;
	newForms?: number;
}): Record<string, string> {
	const badges: Record<string, string> = {};
	if (input.openOrders > 0) badges.zamowienia = String(input.openOrders);
	if (input.pendingReturns && input.pendingReturns > 0)
		badges.zwroty = String(input.pendingReturns);
	if (input.newForms && input.newForms > 0) badges.formularze = String(input.newForms);
	return badges;
}
