"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { SalesStatistics } from "@/lib/admin/analytics/sales-stats";
import { formatPrice } from "@/lib/format";
import { Badge, Card } from "./chrome";

const CHART_STROKE = "#AF7C61";

const chartTooltipStyle = {
	background: "var(--card)",
	border: "1px solid var(--border)",
	borderRadius: 10,
	fontSize: 13,
	color: "var(--foreground)",
} as const;

function revenueAxisTick(value: number): string {
	if (value >= 1_000) return `${Math.round(value / 1000)}k`;
	return String(Math.round(value));
}

type Props = {
	stats: SalesStatistics;
};

export function DashboardCharts({ stats }: Props) {
	if (!stats.hasData) {
		return (
			<Card>
				<p className="text-sm text-muted-foreground">
					Brak zamówień w Medusie — wykresy pojawią się po pierwszych transakcjach.
				</p>
			</Card>
		);
	}

	return (
		<div className="grid gap-6 lg:grid-cols-3">
			<Card className="lg:col-span-2">
				<div className="mb-4 flex flex-wrap items-end justify-between gap-2">
					<div>
						<h2 className="font-serif text-lg text-foreground">Przychód miesięczny</h2>
						<p className="mt-0.5 text-xs text-muted-foreground">{stats.periodLabel} · opłacone</p>
					</div>
					{stats.truncated ? <Badge tone="warning">Max. 2000 zamówień</Badge> : null}
				</div>
				<ResponsiveContainer width="100%" height={220}>
					<AreaChart data={stats.monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
						<defs>
							<linearGradient id="panel-revenue-grad" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={CHART_STROKE} stopOpacity={0.3} />
								<stop offset="95%" stopColor={CHART_STROKE} stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
						<XAxis
							dataKey="miesiac"
							tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
							axisLine={false}
							tickLine={false}
						/>
						<YAxis
							tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
							axisLine={false}
							tickLine={false}
							tickFormatter={revenueAxisTick}
						/>
						<Tooltip
							contentStyle={chartTooltipStyle}
							formatter={(v) => {
								if (typeof v !== "number") return ["—", "Przychód"];
								return [formatPrice(v, stats.currencyCode), "Przychód"];
							}}
						/>
						<Area
							type="monotone"
							dataKey="przychod"
							stroke={CHART_STROKE}
							strokeWidth={2}
							fill="url(#panel-revenue-grad)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</Card>

			<Card>
				<h2 className="font-serif text-lg text-foreground">Zamówienia wg statusu</h2>
				<p className="mt-0.5 text-xs text-muted-foreground">Cała próbka ({stats.orderCount})</p>
				<div className="mt-4 space-y-3">
					{stats.byStatus.map((item) => (
						<div key={item.label}>
							<div className="mb-1 flex justify-between text-sm">
								<span className="text-foreground">{item.label}</span>
								<span className="font-medium text-foreground">{item.val}</span>
							</div>
							<div className="h-1.5 rounded-full bg-muted">
								<div
									className={`h-1.5 rounded-full ${item.color}`}
									style={{ width: `${item.pct}%` }}
								/>
							</div>
						</div>
					))}
				</div>
			</Card>
		</div>
	);
}
