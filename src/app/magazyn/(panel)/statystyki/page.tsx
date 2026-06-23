import { PageHeader } from "@/components/panel/chrome";
import { loadAdmin } from "@/lib/admin/load";
import { listAdminOrdersForStatistics } from "@/lib/admin/orders";
import { fetchAnalyticsDashboard } from "@/lib/admin/analytics/fetch-analytics";
import { buildSalesStatistics } from "@/lib/admin/analytics/sales-stats";
import { StatisticsTabs } from "./statistics-tabs";

export const dynamic = "force-dynamic";

export const metadata = { title: "Statystyki" };

export default async function StatystykiPage() {
	const [{ orders, truncated }, analyticsData] = await loadAdmin(() =>
		Promise.all([listAdminOrdersForStatistics(), fetchAnalyticsDashboard({ rangeDays: 30 })]),
	);

	const salesStats = buildSalesStatistics(orders, { truncated });

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				className="mb-0"
				title="Statystyki"
				description="Sprzedaż z Medusa. Analityka ruchu (GA4 / PostHog) — włączy się po konfiguracji ENV."
			/>
			<StatisticsTabs salesStats={salesStats} analyticsData={analyticsData} />
		</div>
	);
}
