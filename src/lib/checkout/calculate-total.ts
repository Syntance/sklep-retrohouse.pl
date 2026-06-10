import type { Product } from "@/lib/products/types";
import type { ShippingMethod } from "@/lib/types/checkout";
import { SHIPPING_OPTIONS } from "./shipping-options";

/**
 * Oblicza sumy checkoutu w groszach (integer).
 * Ceny produktów w katalogu są w PLN (np. 190 = 190 zł) → mnożymy × 100.
 */
export function calculateCheckoutTotal(
	items: Product[],
	shippingMethod: ShippingMethod,
): {
	subtotalInCents: number;
	shippingInCents: number;
	totalInCents: number;
} {
	const subtotalInCents = items.reduce((sum, item) => sum + Math.round(item.price * 100), 0);

	const shipping = SHIPPING_OPTIONS.find((opt) => opt.value === shippingMethod);
	const shippingInCents = shipping?.priceInCents ?? 0;

	return {
		subtotalInCents,
		shippingInCents,
		totalInCents: subtotalInCents + shippingInCents,
	};
}
