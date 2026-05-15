"use client";

import Link from "next/link";
import { ArrowRightIcon, GiftIcon } from "@/components/icons";
import type { GiftBudgetBucket } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/posthog";

const BUDGET_TILE_ANALYTICS: Record<string, GiftBudgetBucket> = {
	"do-100": "do_100",
	"100-300": "100_300",
	"300-500": "300_500",
	"500-plus": "500_plus",
};

type Tile = {
	id: string;
	label: string;
	caption: string;
};

type GiftBudgetTilesProps = {
	tiles: ReadonlyArray<Tile>;
};

/**
 * Cztery progi budżetowe — każdy emit gift_budget_filter_selected
 * z `budget_bucket` zgodnie z analityką Notion.
 */
export function GiftBudgetTiles({ tiles }: GiftBudgetTilesProps) {
	return (
		<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{tiles.map((tile) => {
				const bucket = BUDGET_TILE_ANALYTICS[tile.id];
				return (
					<li key={tile.id}>
						<Link
							href={`/sklep?cena=${tile.id}`}
							onClick={() =>
								track({
									name: "gift_budget_filter_selected",
									properties: { budget_bucket: bucket ?? "do_100" },
								})
							}
							className="group/budget flex h-full flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-terracotta hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
						>
							<span className="grid size-10 place-items-center rounded-full bg-terracotta text-terracotta-foreground">
								<GiftIcon className="size-5" />
							</span>
							<span className="font-display text-2xl font-semibold leading-tight">
								{tile.label}
							</span>
							<span className="text-sm text-foreground/70">{tile.caption}</span>
							<span className="cta-text inline-flex items-center gap-1 text-xs text-foreground">
								Filtruj sklep
								<ArrowRightIcon className="size-3.5 transition-transform group-hover/budget:translate-x-0.5" />
							</span>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
