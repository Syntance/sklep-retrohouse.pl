import { describe, expect, it } from "vitest";
import { calculateCheckoutTotal } from "@/lib/checkout/calculate-total";
import type { Product } from "@/lib/products/types";

function mockProduct(price: number): Product {
	return {
		medusaId: "prod_1",
		slug: "test-product",
		name: "Test",
		price,
		currencyCode: "PLN",
		category: "inne",
		categoryLabel: "Inne",
		epoch: "mid-century",
		epochLabel: "Mid-century",
		manufacturer: "Test",
		dimensions: "10x10",
		condition: "Dobry",
		badges: [],
		defects: [],
		pickupOnly: false,
		addedAt: "2026-01-01",
		story: "Test",
		shortDescription: "Test",
		imageHues: ["#000", "#111", "#222"],
		images: [],
		popularity: 1,
	};
}

describe("calculateCheckoutTotal", () => {
	it("sumuje produkty i wysyłkę w groszach", () => {
		const result = calculateCheckoutTotal([mockProduct(190), mockProduct(50)], "inpost");
		expect(result.subtotalInCents).toBe(24000);
		expect(result.shippingInCents).toBe(1900);
		expect(result.totalInCents).toBe(25900);
	});

	it("odbiór osobisty = 0 groszy wysyłki", () => {
		const result = calculateCheckoutTotal([mockProduct(100)], "pickup_nt");
		expect(result.shippingInCents).toBe(0);
		expect(result.totalInCents).toBe(10000);
	});
});
