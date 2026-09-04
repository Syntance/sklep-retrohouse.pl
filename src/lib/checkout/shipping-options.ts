import "server-only";

import { cache } from "react";
import { getCmsServiceToken, MEDUSA_BASE_URL } from "@/lib/admin/medusa-admin";
import {
	isShippingOptionEnabledInCheckout,
	type ShippingOptionRuleLike,
} from "@/lib/medusa/shipping-option-visibility";

/**
 * Metody wysyłki pokazywane klientowi w checkoucie — czytane z Medusy, NIE
 * hardkodowane.
 *
 * Wcześniej checkout miał zaszytą listę (InPost 19 zł / DPD 29 / DHL 39 /
 * odbiór 0) i dobierał opcję Medusy regexem po nazwie. Skutki: zmiana nazwy w
 * panelu rozbijała dopasowanie, wyłączenie metody nie ukrywało jej klientowi,
 * a zmiana ceny w panelu nie zmieniała kwoty pokazywanej w sklepie. Teraz
 * źródłem prawdy jest Medusa, a wybór jedzie po `id`.
 */
export type CheckoutShippingOption = {
	id: string;
	name: string;
	description: string | null;
	/** Cena w PLN (major units), tak jak zwraca Medusa v2. */
	pricePln: number;
};

type MedusaShippingOption = {
	id: string;
	name: string;
	type?: { label?: string; description?: string | null } | null;
	rules?: ShippingOptionRuleLike[] | null;
	prices?: Array<{ amount?: number; currency_code?: string }> | null;
};

const FIELDS = [
	"id",
	"name",
	"type.label",
	"type.description",
	"rules.id",
	"rules.attribute",
	"rules.operator",
	"rules.value",
	"prices.amount",
	"prices.currency_code",
].join(",");

/**
 * Awaryjna lista, gdy nie da się odpytać Medusy (brak `MEDUSA_ADMIN_*`).
 * `id` to sentinel `fallback:*` — serwer rozpozna go i dobierze opcję po
 * rodzaju, ale NIGDY po cichu nie podstawi niewłaściwej (patrz create-order).
 */
export const FALLBACK_SHIPPING_OPTIONS: CheckoutShippingOption[] = [
	{
		id: "fallback:pickup",
		name: "Odbiór osobisty w Nowym Targu",
		description: "Tego samego dnia, po wcześniejszym kontakcie",
		pricePln: 0,
	},
	{
		id: "fallback:courier",
		name: "Wysyłka kurierska",
		description: "1–3 dni robocze",
		pricePln: 0,
	},
];

export function isFallbackShippingOptionId(id: string): boolean {
	return id.startsWith("fallback:");
}

/**
 * Zwraca metody widoczne w sklepie. Pusta tablica = brak konfiguracji lub brak
 * tokenu serwisowego — wtedy checkout pokazuje listę awaryjną.
 */
export const listCheckoutShippingOptions = cache(async (): Promise<CheckoutShippingOption[]> => {
	const token = await getCmsServiceToken();
	if (!token) return [];

	try {
		const res = await fetch(`${MEDUSA_BASE_URL}/admin/shipping-options?limit=50&fields=${FIELDS}`, {
			headers: { Authorization: `Bearer ${token}` },
			signal: AbortSignal.timeout(10_000),
		});
		if (!res.ok) return [];

		const data = (await res.json()) as { shipping_options?: MedusaShippingOption[] };
		return (data.shipping_options ?? [])
			.filter((option) => isShippingOptionEnabledInCheckout(option.rules))
			.map((option) => ({
				id: option.id,
				name: option.name,
				description: option.type?.description?.trim() || option.type?.label?.trim() || null,
				pricePln: option.prices?.find((p) => p.currency_code === "pln")?.amount ?? 0,
			}))
			.sort((a, b) => a.pricePln - b.pricePln);
	} catch {
		return [];
	}
});
