import { describe, expect, it } from "vitest";
import { buildSalesStatistics } from "@/lib/admin/analytics/sales-stats";
import type { AdminOrderStatsRow } from "@/lib/admin/order-types";

function order(partial: Partial<AdminOrderStatsRow> & Pick<AdminOrderStatsRow, "id">): AdminOrderStatsRow {
	return {
		displayId: 1,
		status: "completed",
		paymentStatus: "captured",
		fulfillmentStatus: "delivered",
		email: "a@b.pl",
		customerName: "Test",
		currencyCode: "PLN",
		total: 0,
		itemCount: 1,
		createdAt: "2026-06-15T10:00:00.000Z",
		shippingMethodName: null,
		lineItems: [],
		...partial,
	};
}

describe("buildSalesStatistics", () => {
	it("traktuje kwoty Medusa jako PLN (bez dzielenia przez 100)", () => {
		const stats = buildSalesStatistics([
			order({ id: "1", total: 1_500, paymentStatus: "captured", createdAt: "2026-06-10T12:00:00.000Z" }),
			order({ id: "2", total: 500, paymentStatus: "not_paid", createdAt: "2026-06-11T12:00:00.000Z" }),
		]);

		expect(stats.capturedRevenuePln).toBe(1_500);
		const june = stats.monthly.find((m) => m.miesiac.startsWith("Cze"));
		expect(june?.przychod).toBe(1_500);
		expect(june?.zamowienia).toBe(2);
	});

	it("grupuje miesiąc po dacie ISO bez strefy czasowej", () => {
		const stats = buildSalesStatistics([
			order({
				id: "1",
				total: 100,
				createdAt: "2026-01-31T23:30:00.000Z",
			}),
		]);

		const sty = stats.monthly.find((m) => m.miesiac.startsWith("Sty"));
		expect(sty?.zamowienia).toBe(1);
	});
});
