import type { CHECKOUT_SHIPPING } from "@/lib/validation/checkout";

/** Ceny ZAWSZE integer grosze w logice. */
export type ShippingMethod = (typeof CHECKOUT_SHIPPING)[number];

export type ShippingOption = {
	value: ShippingMethod;
	label: string;
	description: string;
	priceInCents: number;
	estimatedDays?: string;
	radio: string;
};

export type PaymentProviderOption = {
	id: string;
	name: string;
	description: string;
	methods?: string[];
};
