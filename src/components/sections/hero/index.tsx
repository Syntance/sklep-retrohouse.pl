"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ChevronDownIcon } from "@/components/icons";
import { Container, CtaLink, Eyebrow, Section, ctaPrimaryButtonClassName } from "@/components/primitives";
import { track } from "@/lib/analytics/posthog";
import type { HeroProductImage } from "@/lib/sanity/home-hero";
import { cn } from "@/lib/utils";

const HERO_HEADLINE = "Antyki z\u00a0prawdziwą historią";
const HERO_SUB_LEAD = "Prosto z\u00a0Wiednia";
const HERO_SUB =
	"Zero pośredników, 100% pewność pochodzenia. Sklep w\u00a0Nowym Targu i\u00a0wysyłka po\u00a0całej Polsce.";

type HeroSectionProps = {
	liveBadge?: { dateLabel: string; dropTitle: string } | null;
	heroProduct?: HeroProductImage | null;
};

/**
 * Hero homepage — H1 + podtytuł + lead, CTA scroll / sklep.
 *
 * Prawa kolumna: zdjęcie produktu z Sanity (`homePage`), albo placeholder gdy brak obrazu / CMS.
 * Pierwszy CTA: „POZNAJ NAS” → smooth scroll do `#home-kategorie`.
 * Bez fabricated cytatów klientów — Social proof przeniesiony do dedykowanej sekcji.
 */
export function HeroSection({ liveBadge, heroProduct }: HeroSectionProps) {
	const scrollToDiscoverSection = () => {
		track({ name: "hero_cta_clicked", properties: { variant: "primary" } });
		const el = document.getElementById("home-kategorie");
		if (!el) return;
		const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		el.scrollIntoView({
			behavior: prefersReduced ? "auto" : "smooth",
			block: "start",
		});
	};

	return (
		<Section spacing="lg" tone="paper" id="hero" className="scroll-mt-16 overflow-hidden">
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
							<button
								type="button"
								onClick={scrollToDiscoverSection}
								className={cn(ctaPrimaryButtonClassName)}
								aria-label="Przewiń do sekcji poniżej — Poznaj nas"
							>
								<span className="flex items-center gap-2">POZNAJ NAS</span>
								<ChevronDownIcon
									className="size-4 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/cta:translate-y-0.5"
									aria-hidden="true"
								/>
							</button>
							<CtaLink
								href="/sklep"
								variant="secondary"
								onClick={() =>
									track({
										name: "hero_cta_clicked",
										properties: { variant: "secondary" },
									})
								}
							>
								ZOBACZ SKLEP
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

					{heroProduct ? (
						<HeroProductPhoto image={heroProduct} />
					) : (
						<HeroProductPlaceholder />
					)}
				</div>
			</Container>
		</Section>
	);
}

function HeroProductPlaceholder() {
	return (
		<div
			className="relative mx-auto flex aspect-4/5 w-full max-w-md flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-walnut/30 bg-foreground/[0.035] px-6 py-10 text-center lg:mx-0 lg:max-w-none"
			role="img"
			aria-label="Placeholder: zdjęcie produktu na hero — do uzupełnienia w Sanity"
		>
			<span aria-hidden="true" className="font-display text-3xl text-walnut/35">
				◆
			</span>
			<p className="max-w-56 text-pretty text-sm leading-relaxed text-foreground/55">
				Tu wyświetli się zdjęcie produktu ustawione w Sanity (Strona główna).
			</p>
		</div>
	);
}

function HeroProductPhoto({ image }: { image: HeroProductImage }) {
	return (
		<figure className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
			<Image
				src={image.src}
				alt={image.alt}
				width={image.width}
				height={image.height}
				className="h-auto w-full rounded-2xl border border-walnut/15 object-cover shadow-card"
				sizes="(min-width: 1024px) 34vw, min(22rem, 92vw)"
				priority
				fetchPriority="high"
			/>
		</figure>
	);
}
