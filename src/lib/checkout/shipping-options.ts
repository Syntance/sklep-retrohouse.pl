import type { ShippingOption } from "@/lib/types/checkout";

export const SHIPPING_OPTIONS: ShippingOption[] = [
	{
		value: "inpost",
		radio: "paczkomat",
		label: "InPost Paczkomaty",
		description: "2–3 dni robocze · domyślny wybór",
		priceInCents: 1900,
		estimatedDays: "2-3",
	},
	{
		value: "dpd",
		radio: "kurier-dpd",
		label: "Kurier DPD",
		description: "1–2 dni robocze · standardowe gabaryty",
		priceInCents: 2900,
		estimatedDays: "1-2",
	},
	{
		value: "dhl",
		radio: "kurier-dhl",
		label: "Kurier DHL",
		description: "1–2 dni robocze · większe gabaryty",
		priceInCents: 3900,
		estimatedDays: "1-2",
	},
	{
		value: "pickup_nt",
		radio: "odbior-nt",
		label: "Odbiór osobisty w Nowym Targu",
		description: "Tego samego dnia, po wcześniejszym kontakcie",
		priceInCents: 0,
	},
];
