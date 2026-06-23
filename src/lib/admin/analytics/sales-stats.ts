import type { AdminOrderStatsRow, OrderPaymentStatus, OrderStatus } from "@/lib/admin/order-types";
import { orderStatusBadge } from "@/lib/admin/order-status";

const MONTH_LABELS = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"] as const;

/** Medusa Admin — kwoty zamówień w PLN (major), jak `formatPrice`. */
const PAID_PAYMENT: OrderPaymentStatus[] = ["captured", "partially_captured"];

export function isPaidPaymentStatus(paymentStatus: OrderPaymentStatus): boolean {
	return PAID_PAYMENT.includes(paymentStatus);
}

export type MonthlySalesPoint = {
	miesiac: string;
	/** Przychód w PLN (zaksięgowane płatności). */
	przychod: number;
	zamowienia: number;
};

export type StatusBreakdownRow = {
	label: string;
	val: number;
	color: string;
	pct: number;
};

export type TopProductRow = {
	nazwa: string;
	sprzedane: number;
	przychod: number;
};

export type ShareRow = {
	name: string;
	value: number;
	pct: number;
};

export type SalesStatistics = {
	monthly: MonthlySalesPoint[];
	byStatus: StatusBreakdownRow[];
	topProducts: TopProductRow[];
	shippingMethods: ShareRow[];
	orderCount: number;
	capturedRevenuePln: number;
	hasData: boolean;
	periodLabel: string;
	truncated: boolean;
	currencyCode: string;
};

const STATUS_COLORS: Record<OrderStatus, string> = {
	completed: "bg-emerald-500",
	pending: "bg-sky-500",
	requires_action: "bg-amber-500",
	canceled: "bg-red-500",
	draft: "bg-muted-foreground",
	archived: "bg-muted-foreground",
};

function isPaidOrder(paymentStatus: OrderPaymentStatus): boolean {
	return isPaidPaymentStatus(paymentStatus);
}

/** YYYY-MM z ISO — bez przesunięć strefy czasowej. */
function monthKey(iso: string): string | null {
	if (iso.length < 7) return null;
	return iso.slice(0, 7);
}

function formatMonthLabel(key: string, showYear: boolean): string {
	const [yearStr, monthStr] = key.split("-");
	const idx = Number(monthStr) - 1;
	const short = MONTH_LABELS[idx] ?? monthStr;
	return showYear ? `${short} ${yearStr}` : short;
}

function buildShareRows(counts: Map<string, number>): ShareRow[] {
	const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
	if (total === 0) return [];

	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1])
		.map(([name, value]) => ({
			name,
			value,
			pct: Math.round((value / total) * 1000) / 10,
		}));
}

/** Agregacja zamówień Medusa Admin API. */
export function buildSalesStatistics(
	orders: AdminOrderStatsRow[],
	options?: { truncated?: boolean },
): SalesStatistics {
	const captured = orders.filter((o) => isPaidOrder(o.paymentStatus));
	const currencyCode = orders[0]?.currencyCode ?? "PLN";

	const now = new Date();
	const monthKeys: string[] = [];
	for (let i = 5; i >= 0; i -= 1) {
		const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
		monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
	}

	const yearsInWindow = new Set(monthKeys.map((k) => k.slice(0, 4)));
	const showYearOnMonths = yearsInWindow.size > 1;

	const monthlyMap = new Map(monthKeys.map((k) => [k, { przychodPln: 0, zamowienia: 0 }]));

	for (const order of orders) {
		const key = monthKey(order.createdAt);
		if (!key || !monthlyMap.has(key)) continue;
		const bucket = monthlyMap.get(key)!;
		bucket.zamowienia += 1;
		if (isPaidOrder(order.paymentStatus)) {
			bucket.przychodPln += order.total;
		}
	}

	const monthly: MonthlySalesPoint[] = monthKeys.map((key) => {
		const bucket = monthlyMap.get(key)!;
		return {
			miesiac: formatMonthLabel(key, showYearOnMonths),
			przychod: Math.round(bucket.przychodPln),
			zamowienia: bucket.zamowienia,
		};
	});

	const statusCounts = new Map<OrderStatus, number>();
	for (const order of orders) {
		statusCounts.set(order.status, (statusCounts.get(order.status) ?? 0) + 1);
	}

	const orderTotal = orders.length || 1;
	const byStatus: StatusBreakdownRow[] = [...statusCounts.entries()]
		.sort((a, b) => b[1] - a[1])
		.map(([status, val]) => ({
			label: orderStatusBadge(status).label,
			val,
			color: STATUS_COLORS[status],
			pct: Math.round((val / orderTotal) * 1000) / 10,
		}));

	const productMap = new Map<string, { sprzedane: number; przychod: number }>();
	const shippingMap = new Map<string, number>();

	for (const order of orders) {
		if (order.shippingMethodName) {
			const name = order.shippingMethodName.trim();
			shippingMap.set(name, (shippingMap.get(name) ?? 0) + 1);
		}
		if (!isPaidOrder(order.paymentStatus)) continue;
		for (const item of order.lineItems) {
			if (item.quantity <= 0) continue;
			const title = item.title.trim() || "Produkt";
			const prev = productMap.get(title) ?? { sprzedane: 0, przychod: 0 };
			productMap.set(title, {
				sprzedane: prev.sprzedane + item.quantity,
				przychod: prev.przychod + item.totalPln,
			});
		}
	}

	const topProducts: TopProductRow[] = [...productMap.entries()]
		.sort((a, b) => b[1].przychod - a[1].przychod)
		.slice(0, 5)
		.map(([nazwa, stats]) => ({ nazwa, ...stats }));

	const capturedRevenuePln = captured.reduce((sum, o) => sum + o.total, 0);

	return {
		monthly,
		byStatus,
		topProducts,
		shippingMethods: buildShareRows(shippingMap),
		orderCount: orders.length,
		capturedRevenuePln,
		hasData: orders.length > 0,
		periodLabel: "ostatnie 6 miesięcy · Medusa Admin API",
		truncated: options?.truncated ?? false,
		currencyCode,
	};
}
