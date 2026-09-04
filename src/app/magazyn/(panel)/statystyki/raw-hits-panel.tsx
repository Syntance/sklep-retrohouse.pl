"use client";

import type { RawHitsData } from "@/lib/analytics/raw-hits";

function formatDay(date: string): string {
	const [, month, day] = date.split("-");
	return `${day}.${month}`;
}

export function RawHitsPanel({ data }: { data: RawHitsData }) {
	if (data.status === "disabled") {
		return (
			<div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
				<p className="font-medium text-foreground">Surowe wejścia są wyłączone.</p>
				<p className="mt-1">
					Ustaw <code className="text-xs">UPSTASH_REDIS_REST_URL</code> i{" "}
					<code className="text-xs">UPSTASH_REDIS_REST_TOKEN</code>, żeby zbierać licznik wejść
					niezależny od zgody na cookies.
				</p>
			</div>
		);
	}

	if (data.status === "error") {
		return (
			<p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
				{data.reason}
			</p>
		);
	}

	const peak = Math.max(1, ...data.daily.map((day) => day.hits));

	return (
		<div className="flex flex-col gap-6">
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="rounded-xl border border-border bg-card p-4">
					<p className="text-xs text-muted-foreground uppercase">Wejścia w okresie</p>
					<p className="mt-1 text-2xl font-semibold tabular-nums">{data.totalHits}</p>
				</div>
				<div className="rounded-xl border border-border bg-card p-4">
					<p className="text-xs text-muted-foreground uppercase">Zliczanie od</p>
					<p className="mt-1 text-2xl font-semibold tabular-nums">
						{data.trackingSince ?? "—"}
					</p>
				</div>
			</div>

			<section className="rounded-xl border border-border bg-card p-4">
				<h3 className="text-sm font-medium text-foreground">Wejścia dzień po dniu</h3>
				{data.totalHits === 0 ? (
					<p className="mt-3 text-sm text-muted-foreground">
						Brak wejść w tym okresie. Licznik startuje po pierwszej wizycie na stronie.
					</p>
				) : (
					<ul className="mt-3 flex h-40 items-end gap-1">
						{data.daily.map((day) => (
							<li
								key={day.date}
								className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
								title={`${day.date}: ${day.hits}`}
							>
								<span
									className="w-full rounded-t bg-primary/70"
									style={{ height: `${Math.round((day.hits / peak) * 100)}%` }}
									aria-hidden
								/>
								<span className="truncate text-[0.6rem] text-muted-foreground">
									{formatDay(day.date)}
								</span>
							</li>
						))}
					</ul>
				)}
			</section>

			<section className="rounded-xl border border-border bg-card p-4">
				<h3 className="text-sm font-medium text-foreground">Najczęstsze ścieżki</h3>
				{data.topPaths.length === 0 ? (
					<p className="mt-3 text-sm text-muted-foreground">Brak danych.</p>
				) : (
					<ul className="mt-3 divide-y divide-border">
						{data.topPaths.map((row) => (
							<li key={row.path} className="flex items-center justify-between gap-3 py-2 text-sm">
								<span className="truncate font-mono text-xs text-foreground">{row.path}</span>
								<span className="shrink-0 tabular-nums text-muted-foreground">{row.hits}</span>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
