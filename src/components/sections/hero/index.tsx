"use client";

import Link from "next/link";
import {
	ArrowRightIcon,
	CheckIcon,
	PackageIcon,
	PinIcon,
	ShieldIcon,
} from "@/components/icons";
import { Container, CtaLink, Eyebrow, Section } from "@/components/primitives";
import { track } from "@/lib/analytics/posthog";

const HERO_HEADLINE = "Ratujemy skarby z\u00a0wiedeńskich kamienic.";
const HERO_SUB_LEAD = "Każdy przedmiot z\u00a0prawdziwą historią.";
const HERO_SUB =
	"Zero pośredników, 100% pewność pochodzenia. Sklep w\u00a0Nowym Targu i\u00a0wysyłka po\u00a0całej Polsce.";

type HeroSectionProps = {
	liveBadge?: { dateLabel: string; dropTitle: string } | null;
};

/**
 * Hero homepage — copy 1:1 ze schematu Notion „Homepage / (strona główna)"
 * (filar 2 marki + archetyp Odkrywca-Ratownik z brandbooka).
 *
 * Prawa kolumna: panel pochodzenia (Wiedeń → NT → Twój dom) + 3 trust signals.
 * Bez fabricated cytatów klientów — Social proof przeniesiony do dedykowanej sekcji.
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
				<div className="grid gap-10 lg:grid-cols-[1.2fr_0.85fr] lg:items-center">
					<div className="flex flex-col gap-6">
						<Eyebrow variant="script">Witamy w RetroHouse</Eyebrow>
						<h1 className="text-balance font-display text-[clamp(2.1rem,4.8vw,3.8rem)] font-medium leading-[1.04] text-foreground">
							<span className="block">{HERO_HEADLINE}</span>
							<span className="mt-1 block text-foreground/80">{HERO_SUB_LEAD}</span>
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
								Odwiedź nas w Nowym Targu
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

					<HeroProvenance />
				</div>
			</Container>
		</Section>
	);
}

function HeroProvenance() {
	return (
		<aside
			className="relative w-full overflow-hidden rounded-2xl border border-walnut/15 bg-card p-7 shadow-card md:p-8"
			aria-label="Pochodzenie i gwarancje"
		>
			<div
				aria-hidden="true"
				className="absolute inset-0 -z-10"
				style={{
					backgroundImage:
						"radial-gradient(80% 60% at 30% 10%, oklch(0.92 0.04 80 / 0.55), transparent 60%)",
				}}
			/>

			<div className="flex items-center gap-2 text-brass">
				<span
					aria-hidden="true"
					className="inline-flex size-7 items-center justify-center rounded-full bg-brass/15"
				>
					<PinIcon className="size-3.5" />
				</span>
				<span className="cta-text text-[0.7rem]">Pochodzenie 100%</span>
			</div>

			<p className="mt-4 font-display text-xl leading-snug text-foreground md:text-2xl">
				Z&nbsp;wiedeńskich kamienic, prosto do&nbsp;Twojego domu.
			</p>

			<ol
				aria-label="Trasa przedmiotu"
				className="mt-5 flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-foreground/65"
			>
				<li className="font-semibold text-foreground">🇦🇹&nbsp;Wiedeń</li>
				<li aria-hidden="true" className="text-walnut/40">→</li>
				<li>Nowy Targ</li>
				<li aria-hidden="true" className="text-walnut/40">→</li>
				<li>Twój dom</li>
			</ol>

			<ul className="mt-6 space-y-2.5 border-t border-walnut/15 pt-5 text-sm">
				<TrustItem
					icon={<CheckIcon className="size-3.5" />}
					text="Karta historii przy każdym przedmiocie"
				/>
				<TrustItem
					icon={<PackageIcon className="size-3.5" />}
					text="Bibułka, ubezpieczona wysyłka"
				/>
				<TrustItem
					icon={<ShieldIcon className="size-3.5" />}
					text="14 dni na zwrot bez tłumaczenia"
				/>
			</ul>
		</aside>
	);
}

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
	return (
		<li className="flex items-start gap-2.5 text-foreground/80">
			<span
				aria-hidden="true"
				className="mt-0.5 grid size-5 place-items-center rounded-full bg-terracotta/15 text-terracotta"
			>
				{icon}
			</span>
			<span className="leading-snug">{text}</span>
		</li>
	);
}
