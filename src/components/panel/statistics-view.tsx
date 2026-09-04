"use client";

import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { SalesStatistics } from "@/lib/admin/analytics/sales-stats";
import { formatPrice } from "@/lib/format";
import { Badge, Card } from "./chrome";

const CHART_STROKE = "#AF7C61";
const CHART_COLORS = ["#AF7C61", "#725750", "#C9A48D", "#8f7a74", "#5c4a44"];

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

function EmptySalesState() {
	return (
		<Card>
			<h2 className="font-serif text-lg text-foreground">Brak danych sprzedażowych</h2>
			<p className="mt-2 text-sm text-muted-foreground">
				Statystyki budowane są z zamówień Medusa Admin API. Gdy pojawią się pierwsze opłacone
				zamówienia, zobaczysz tutaj wykresy przychodu i liczby transakcji.
			</p>
		</Card>
	);
}

export function StatisticsView({ stats }: Props) {
	if (!stats.hasData) {
		return <EmptySalesState />;
	}

	const topProductMax = stats.topProducts[0]?.przychod ?? 1;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center gap-2">
				<p className="text-xs text-muted-foreground">{stats.periodLabel}</p>
				{stats.truncated ? (
					<Badge tone="warning">Pokazano max. 2000 najnowszych zamówień</Badge>
				) : null}
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<h2 className="font-serif text-lg text-foreground">Przychód miesięczny</h2>
					<p className="mt-0.5 text-xs text-muted-foreground">
						Zaksięgowane płatności (captured / częściowo captured)
					</p>
					<div className="mt-4">
						<ResponsiveContainer width="100%" height={200}>
							<AreaChart data={stats.monthly} margin={{ left: -20 }}>
								<defs>
									<linearGradient id="stats-revenue-grad" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={CHART_STROKE} stopOpacity={0.3} />
										<stop offset="95%" stopColor={CHART_STROKE} stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
								<XAxis
									dataKey="miesiac"
									tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis
									tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
									axisLine={false}
									tickLine={false}
									tickFormatter={revenueAxisTick}
								/>
								<Tooltip
									contentStyle={chartTooltipStyle}
									formatter={(v) => {
										if (typeof v !== "number") return ["—"];
										return [formatPrice(v, stats.currencyCode)];
									}}
								/>
								<Area
									type="monotone"
									dataKey="przychod"
									stroke={CHART_STROKE}
									strokeWidth={2}
									fill="url(#stats-revenue-grad)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</Card>

				<Card>
					<h2 className="font-serif text-lg text-foreground">Liczba zamówień</h2>
					<p className="mt-0.5 text-xs text-muted-foreground">Wszystkie statusy w oknie 6 mies.</p>
					<div className="mt-4">
						<ResponsiveContainer width="100%" height={200}>
							<BarChart data={stats.monthly} margin={{ left: -20 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
								<XAxis
									dataKey="miesiac"
									tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis
									tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
									axisLine={false}
									tickLine={false}
									allowDecimals={false}
								/>
								<Tooltip contentStyle={chartTooltipStyle} />
								<Bar dataKey="zamowienia" fill={CHART_STROKE} radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<Card>
					<h2 className="font-serif text-lg text-foreground">Zamówienia wg statusu</h2>
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

				<Card className="lg:col-span-2">
					<h2 className="font-serif text-lg text-foreground">Metody dostawy</h2>
					{stats.shippingMethods.length === 0 ? (
						<p className="mt-3 text-sm text-muted-foreground">
							Brak danych o wysyłce w zamówieniach.
						</p>
					) : (
						<>
							<div className="mt-4">
								<ResponsiveContainer width="100%" height={170}>
									<PieChart>
										<Pie
											data={stats.shippingMethods}
											cx="50%"
											cy="50%"
											innerRadius={50}
											outerRadius={75}
											dataKey="value"
											nameKey="name"
											paddingAngle={2}
										>
											{stats.shippingMethods.map((entry, i) => (
												<Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
											))}
										</Pie>
										<Tooltip
											contentStyle={chartTooltipStyle}
											formatter={(v) => (typeof v === "number" ? [`${v} zamówień`] : ["—"])}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
							<ul className="mt-3 space-y-1.5">
								{stats.shippingMethods.map((d, i) => (
									<li key={d.name} className="flex items-center justify-between text-xs">
										<span className="flex items-center gap-2 text-muted-foreground">
											<span
												className="inline-block size-2 rounded-full"
												style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
											/>
											{d.name}
										</span>
										<span className="font-medium text-foreground">
											{d.value} · {d.pct}%
										</span>
									</li>
								))}
							</ul>
						</>
					)}
				</Card>
			</div>

			<Card>
				<h2 className="font-serif text-lg text-foreground">Podsumowanie</h2>
				<dl className="mt-4 grid gap-3 sm:grid-cols-2">
					<div className="rounded-lg border border-border bg-muted/30 p-3">
						<dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Zamówienia łącznie
						</dt>
						<dd className="mt-1 font-serif text-2xl text-foreground">{stats.orderCount}</dd>
					</div>
					<div className="rounded-lg border border-border bg-muted/30 p-3">
						<dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Przychód opłacony
						</dt>
						<dd className="mt-1 font-serif text-2xl text-foreground">
							{formatPrice(stats.capturedRevenuePln, stats.currencyCode)}
						</dd>
					</div>
				</dl>
			</Card>

			{stats.topProducts.length > 0 ? (
				<Card>
					<h2 className="font-serif text-lg text-foreground">Top produkty (opłacone)</h2>
					<ol className="mt-4 space-y-3">
						{stats.topProducts.map((p, i) => (
							<li key={p.nazwa} className="flex items-center gap-4">
								<span className="w-5 shrink-0 text-center font-serif text-base text-muted-foreground">
									{i + 1}
								</span>
								<div className="flex-1">
									<div className="mb-1 flex justify-between gap-2">
										<span className="text-sm font-medium text-foreground">{p.nazwa}</span>
										<span className="shrink-0 text-sm font-medium text-foreground">
											{formatPrice(p.przychod, stats.currencyCode)}
										</span>
									</div>
									<div className="flex items-center gap-3">
										<div className="h-1.5 flex-1 rounded-full bg-muted">
											<div
												className="h-1.5 rounded-full bg-primary"
												style={{ width: `${(p.przychod / topProductMax) * 100}%` }}
											/>
										</div>
										<span className="shrink-0 text-xs text-muted-foreground">
											{p.sprzedane} szt.
										</span>
									</div>
								</div>
							</li>
						))}
					</ol>
				</Card>
			) : null}
		</div>
	);
}
