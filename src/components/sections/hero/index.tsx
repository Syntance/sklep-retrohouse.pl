"use client";

import { ArrowRightIcon, QuoteIcon } from "@/components/icons";
import { Container, CtaLink, Eyebrow, Section } from "@/components/primitives";
import { track } from "@/lib/analytics/posthog";
import Link from "next/link";

const HERO_HEADLINE = "Wiedeń trafia\u00a0do\u00a0polskich domów.";
const HERO_SUB =
	"Antyki, które kupujemy bezpośrednio od mieszkańców Wiednia. Każdy z\u00a0historią, kartą pochodzenia i\u00a0bibułką.";
const HERO_QUOTE = {
	body: "Przyjechał wazon zapakowany jak relikwia. Karta z historią to detal, który zmienia wszystko.",
	author: "Anna · Wrocław",
};

type HeroSectionProps = {
	liveBadge?: { dateLabel: string; dropTitle: string } | null;
};

/**
 * Hero homepage — 2 CTA z instrumentacją hero_cta_clicked
 * (variant: 'primary' → /sklep, 'secondary' → /kontakt).
 *
 * Pasek live nad CTA tylko gdy `LIVE_SCHEDULED=true` (przekazane z RSC).
 */
export function HeroSection({ liveBadge }: HeroSectionProps) {
	return (
		<Section spacing="lg" tone="paper" className="overflow-hidden">
			<div
				aria-hidden="true"
				className="absolute inset-0 -z-10"
				style={{
					backgroundImage:
						"radial-gradient(70% 60% at 85% 5%, oklch(0.74 0.10 80 / 0.18), transparent 55%), radial-gradient(50% 50% at -5% 100%, oklch(0.52 0.15 38 / 0.10), transparent 55%)",
				}}
			/>
			<Container size="lg">
				<div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
					<div className="flex flex-col gap-6">
						<Eyebrow variant="script">Witamy w RetroHouse</Eyebrow>
						<h1 className="text-balance font-display text-[clamp(2rem,4.6vw,3.6rem)] font-medium leading-[1.05] text-foreground">
							{HERO_HEADLINE}
						</h1>
						<p className="max-w-xl text-pretty text-base leading-relaxed text-foreground/75 md:text-lg">
							{HERO_SUB}
						</p>
						<div className="mt-1 flex flex-wrap items-center gap-3">
							<CtaLink
								href="/sklep"
								variant="primary"
								onClick={() =>
									track({ name: "hero_cta_clicked", properties: { variant: "primary" } })
								}
							>
								Zobacz, co dziś znaleźliśmy
							</CtaLink>
							<CtaLink
								href="/kontakt"
								variant="secondary"
								onClick={() => {
									track({
										name: "hero_cta_clicked",
										properties: { variant: "secondary" },
									});
									track({
										name: "visit_store_cta_clicked",
										properties: { source: "homepage" },
									});
								}}
							>
								Odwiedź sklep w Nowym Targu
							</CtaLink>
						</div>

						{liveBadge ? (
							<Link
								href="/api/live.ics"
								className="group/live mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-walnut/25 bg-background/60 px-4 py-2 text-xs text-foreground/75 backdrop-blur transition-colors hover:border-terracotta hover:text-terracotta"
								onClick={() =>
									track({
										name: "live_reminder_signup",
										properties: { channel: "calendar" },
									})
								}
							>
								<span
									aria-hidden="true"
									className="size-2 rounded-full bg-terracotta motion-safe:animate-pulse"
								/>
								<span className="cta-text">
									Następny live · {liveBadge.dateLabel} — {liveBadge.dropTitle}
								</span>
								<ArrowRightIcon className="size-3" />
							</Link>
						) : null}
					</div>

					<HeroQuote />
				</div>
			</Container>
		</Section>
	);
}

function HeroQuote() {
	return (
		<aside
			className="relative w-full overflow-hidden rounded-2xl border border-walnut/15 bg-card p-7 shadow-card md:p-9"
			aria-label="Opinia klientki"
		>
			<div
				aria-hidden="true"
				className="absolute inset-0 -z-10"
				style={{
					backgroundImage:
						"radial-gradient(80% 60% at 30% 10%, oklch(0.92 0.04 80 / 0.55), transparent 60%)",
				}}
			/>
			<QuoteIcon className="size-7 text-terracotta" />
			<blockquote className="mt-4 font-display text-xl leading-snug text-foreground md:text-2xl">
				„{HERO_QUOTE.body}”
			</blockquote>
			<p className="mt-5 text-xs uppercase tracking-[0.16em] text-foreground/60">
				{HERO_QUOTE.author}
			</p>
		</aside>
	);
}
