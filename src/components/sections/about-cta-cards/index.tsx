"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { track } from "@/lib/analytics/posthog";

type CtaCard = {
	href: string;
	eyebrow: string;
	title: string;
	description: string;
	highlight?: boolean;
	analytics:
		| { event: "visit_store_cta_clicked"; source: "/o-nas" }
		| { event: "b2b_landing_clicked"; source: "/o-nas" }
		| { event: "noop" };
};

type AboutCtaCardsProps = { cards: ReadonlyArray<CtaCard> };

/**
 * Dolne karty CTA na /o-nas. Środkowa idzie do /kontakt (pytania,
 * brak osobnego eventu), trzecia (B2B) ma `b2b_landing_clicked`.
 */
export function AboutCtaCards({ cards }: AboutCtaCardsProps) {
	return (
		<div className="grid gap-6 md:grid-cols-3">
			{cards.map((card) => (
				<Link
					key={card.href}
					href={card.href}
					onClick={() => {
						if (card.analytics.event === "noop") return;
						if (card.analytics.event === "visit_store_cta_clicked") {
							track({
								name: "visit_store_cta_clicked",
								properties: { source: card.analytics.source },
							});
							return;
						}
						track({
							name: "b2b_landing_clicked",
							properties: { source: card.analytics.source },
						});
					}}
					className={`group/card flex flex-col justify-between gap-3 rounded-3xl border p-6 transition-colors ${card.highlight ? "border-brass bg-terracotta text-terracotta-foreground" : "border-ink-foreground/15 bg-ink-foreground/5 text-ink-foreground"} hover:border-terracotta`}
				>
					<span
						className={`text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${card.highlight ? "text-terracotta-foreground/85" : "text-brass"}`}
					>
						{card.eyebrow}
					</span>
					<p className="font-display text-2xl font-semibold leading-tight">{card.title}</p>
					<p
						className={`text-sm ${card.highlight ? "text-terracotta-foreground/85" : "text-ink-foreground/70"}`}
					>
						{card.description}
					</p>
					<span className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.16em]">
						Otwórz
						<ArrowRightIcon className="size-4 transition-transform group-hover/card:translate-x-0.5" />
					</span>
				</Link>
			))}
		</div>
	);
}
