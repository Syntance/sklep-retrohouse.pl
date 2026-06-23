import type { BadgeTone } from "./chrome";

/** Demo KPI — zgodne z Moduly (podgląd przed pełną agregacją Medusa). */
export const panelStats = {
	przychod: 148_320_00,
	zamowienia: 1_847,
	klienci: 3_291,
	srednia: 80_26,
} as const;

export const przychodyMiesieczne = [
	{ miesiac: "Sty", przychod: 82_400, zamowienia: 1_032 },
	{ miesiac: "Lut", przychod: 91_200, zamowienia: 1_141 },
	{ miesiac: "Mar", przychod: 103_800, zamowienia: 1_298 },
	{ miesiac: "Kwi", przychod: 118_500, zamowienia: 1_482 },
	{ miesiac: "Maj", przychod: 134_200, zamowienia: 1_679 },
	{ miesiac: "Cze", przychod: 148_320, zamowienia: 1_847 },
] as const;

export const zamowieniaWgStatusu = [
	{ label: "Zrealizowane", val: 1_591, color: "bg-emerald-500", pct: 86 },
	{ label: "W realizacji", val: 189, color: "bg-sky-500", pct: 10 },
	{ label: "Oczekuje", val: 42, color: "bg-amber-500", pct: 2.3 },
	{ label: "Anulowane", val: 25, color: "bg-red-500", pct: 1.4 },
] as const;

export const dostawyStat = [
	{ name: "InPost Paczkomat", value: 58, color: "#AF7C61" },
	{ name: "Kurier DPD", value: 28, color: "#725750" },
	{ name: "Odbiór osobisty", value: 9, color: "#C9A48D" },
	{ name: "Poczta Polska", value: 5, color: "#8f7a74" },
] as const;

export const platnosciStat = [
	{ name: "Przelewy24", value: 51 },
	{ name: "BLIK", value: 30 },
	{ name: "Karta", value: 13 },
	{ name: "PayPo", value: 6 },
] as const;

export const topProduktyStat = [
	{ nazwa: "Waza porcelanowa Augarten", sprzedane: 12, przychod: 48_000_00 },
	{ nazwa: "Lampa art deco", sprzedane: 9, przychod: 36_500_00 },
	{ nazwa: "Komoda biedermeier", sprzedane: 4, przychod: 92_000_00 },
	{ nazwa: "Serwis kawowy Rosenthal", sprzedane: 7, przychod: 21_700_00 },
	{ nazwa: "Stół dębowy vintage", sprzedane: 3, przychod: 54_000_00 },
] as const;

/** Grosze → PLN (UI). */
export function formatKwota(grosze: number): string {
	return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(grosze / 100);
}

export function moduleBadgeFromHref(href: string, badges?: Record<string, string>): string | undefined {
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
	if (input.pendingReturns && input.pendingReturns > 0) badges.zwroty = String(input.pendingReturns);
	if (input.newForms && input.newForms > 0) badges.formularze = String(input.newForms);
	return badges;
}
