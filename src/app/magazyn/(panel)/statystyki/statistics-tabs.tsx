"use client";

import { useState } from "react";
import { StatisticsView } from "@/components/panel/statistics-view";
import type { AnalyticsDashboardData } from "@/lib/admin/analytics/types";
import type { SalesStatistics } from "@/lib/admin/analytics/sales-stats";
import { AnalyticsPanel } from "./analytics-panel";

type StatisticsTab = "sales" | "analytics";

const TABS: Array<{ id: StatisticsTab; label: string; description: string }> = [
	{
		id: "sales",
		label: "Statystyki sprzedażowe",
		description: "Przychód i zamówienia z Medusa Admin API (tylko realne dane sklepu)",
	},
	{
		id: "analytics",
		label: "Analityka",
		description:
			"Ruch i konwersja z GA4 / PostHog — wymaga kluczy serwerowych w ENV (bez konfiguracji zobaczysz status połączenia)",
	},
];

type Props = {
	salesStats: SalesStatistics;
	analyticsData: AnalyticsDashboardData;
};

export function StatisticsTabs({ salesStats, analyticsData }: Props) {
	const [tab, setTab] = useState<StatisticsTab>("sales");
	const activeMeta = TABS.find((item) => item.id === tab) ?? TABS[0]!;

	return (
		<div className="flex flex-col gap-6">
			<div
				className="inline-flex w-fit shrink-0 flex-wrap gap-1 self-start rounded-xl border border-border bg-muted/40 p-1"
				role="tablist"
				aria-label="Sekcje statystyk"
			>
				{TABS.map(({ id, label }) => (
					<button
						key={id}
						type="button"
						role="tab"
						aria-selected={tab === id}
						onClick={() => {
							setTab(id);
						}}
						className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
							tab === id
								? "bg-card text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						{label}
					</button>
				))}
			</div>

			<p className="text-sm text-muted-foreground">{activeMeta.description}</p>

			{tab === "sales" ? (
				<StatisticsView stats={salesStats} />
			) : (
				<AnalyticsPanel data={analyticsData} />
			)}
		</div>
	);
}
