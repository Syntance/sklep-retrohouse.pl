import type { AnalyticsDashboardData } from "./types";

function buildTrafficSeries(base: number, growth = 1.02): Array<{ date: string; label: string; value: number }> {
	const points: Array<{ date: string; label: string; value: number }> = [];
	const now = new Date();
	for (let i = 29; i >= 0; i -= 1) {
		const d = new Date(now);
		d.setDate(d.getDate() - i);
		const iso = d.toISOString().slice(0, 10);
		const label = d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
		const value = Math.round(base * growth ** (29 - i) + (i % 5) * 12);
		points.push({ date: iso, label, value });
	}
	return points;
}

const ga4Traffic = buildTrafficSeries(420);
const posthogTraffic = buildTrafficSeries(390, 1.018);

/** Przykładowy dashboard GA4 + PostHog — podgląd gdy brak ENV. */
export const demoAnalyticsDashboard: AnalyticsDashboardData = {
	fetchedAt: new Date().toISOString(),
	rangeDays: 30,
	ga4: {
		status: "connected",
		label: "GA4 · RetroHouse (demo)",
		kpi: {
			sessions: 8_412,
			users: 6_294,
			pageviews: 22_180,
			purchases: 47,
			revenueMinor: 186_400_00,
			conversionRate: 0.56,
		},
		traffic: ga4Traffic,
		channels: [
			{ channel: "Organic Search", sessions: 3_842, share: 45.7 },
			{ channel: "Direct", sessions: 2_118, share: 25.2 },
			{ channel: "Social", sessions: 904, share: 10.7 },
			{ channel: "Referral", sessions: 652, share: 7.8 },
			{ channel: "Email", sessions: 512, share: 6.1 },
			{ channel: "Paid Search", sessions: 384, share: 4.6 },
		],
		topPages: [
			{ path: "/", views: 6_420, share: 28.9 },
			{ path: "/sklep", views: 4_804, share: 21.7 },
			{ path: "/prezent", views: 2_218, share: 10.0 },
			{ path: "/o-nas", views: 1_891, share: 8.5 },
			{ path: "/kontakt", views: 1_102, share: 5.0 },
			{ path: "/koszyk", views: 876, share: 3.9 },
		],
	},
	posthog: {
		status: "connected",
		label: "PostHog · RetroHouse (demo)",
		kpi: {
			sessions: 7_904,
			users: 6_020,
			pageviews: 21_480,
			purchases: 44,
			revenueMinor: 178_900_00,
			conversionRate: 0.56,
		},
		traffic: posthogTraffic,
		funnel: [
			{ event: "product_view", label: "Wyświetlenie produktu", count: 4_820, rateFromTop: 100 },
			{ event: "add_to_cart", label: "Dodanie do koszyka", count: 842, rateFromTop: 17.5 },
			{ event: "begin_checkout", label: "Rozpoczęcie checkoutu", count: 218, rateFromTop: 4.5 },
			{ event: "purchase", label: "Zakup", count: 44, rateFromTop: 0.9 },
		],
		topEvents: [
			{ event: "$pageview", count: 21_480 },
			{ event: "product_view", count: 4_820 },
			{ event: "add_to_cart", count: 842 },
			{ event: "begin_checkout", count: 218 },
			{ event: "purchase", count: 44 },
			{ event: "search", count: 612 },
			{ event: "newsletter_signup", count: 88 },
		],
	},
};

export function isAnalyticsLive(data: AnalyticsDashboardData): boolean {
	return data.ga4.status === "connected" || data.posthog.status === "connected";
}

export function hasAnalyticsError(data: AnalyticsDashboardData): boolean {
	return data.ga4.status === "error" || data.posthog.status === "error";
}
