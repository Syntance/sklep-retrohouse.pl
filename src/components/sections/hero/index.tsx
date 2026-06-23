"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ChevronDownIcon } from "@/components/icons";
import { Container, CtaLink, Eyebrow, Section, ctaPrimaryButtonClassName } from "@/components/primitives";
import { track } from "@/lib/analytics/posthog";
import type { HeroProductImage } from "@/lib/sanity/home-hero";
import type { HeroContent } from "@/lib/content/types";
import { DEFAULT_HOME_HERO } from "@/lib/content/defaults";
import { cn } from "@/lib/utils";

type HeroSectionProps = {
	liveBadge?: { dateLabel: string; dropTitle: string } | null;
	heroProduct?: HeroProductImage | null;
	/** Treść z CMS (hero block). Gdy undefined — używa DEFAULT_HOME_HERO. */
	cmsHero?: HeroContent | null;
};

/**
 * Hero homepage — H1 + podtytuł + lead, CTA scroll / sklep.
 *
 * Prawa kolumna: zdjęcie produktu z CMS (URL), Sanity lub domyślne `/images/hero-gallery.jpg`.
 * Teksty: z CMS (getPageContent("home").hero) lub DEFAULT_HOME_HERO.
 */
export function HeroSection({ liveBadge, heroProduct, cmsHero }: HeroSectionProps) {
	const hero = cmsHero ?? DEFAULT_HOME_HERO;

	const scrollToDiscoverSection = () => {
		track({ name: "hero_cta_clicked", properties: { variant: "primary" } });
		const targetId = hero.ctaHref.startsWith("#")
			? hero.ctaHref.slice(1)
			: "home-kategorie";
		const el = document.getElementById(targetId);
		if (!el) return;
		const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		el.scrollIntoView({
			behavior: prefersReduced ? "auto" : "smooth",
			block: "start",
		});
	};

	const isScrollCta = hero.ctaHref.startsWith("#");

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
				<div className="grid gap-10 lg:grid-cols-[1.2fr_1.02fr] lg:items-start">
					<div className="flex flex-col gap-6">
						<Eyebrow variant="script">Witamy w RetroHouse</Eyebrow>
						<h1 className="text-balance font-display text-[clamp(2.1rem,4.8vw,3.8rem)] font-medium leading-[1.04] text-foreground">
							<span className="block">{hero.headline}</span>
							{hero.subLead ? (
								<span className="mt-1 block text-foreground/80">{hero.subLead}</span>
							) : null}
						</h1>
						<p className="max-w-xl text-pretty text-base leading-relaxed text-foreground/75 md:text-lg">
							{hero.description}
						</p>
						<div className="mt-1 flex flex-wrap items-center gap-3">
							{isScrollCta ? (
								<button
									type="button"
									onClick={scrollToDiscoverSection}
									className={cn(ctaPrimaryButtonClassName)}
									aria-label={`Przewiń do sekcji poniżej — ${hero.ctaLabel}`}
								>
									<span className="flex items-center gap-2">{hero.ctaLabel}</span>
									<ChevronDownIcon
										className="size-4 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/cta:translate-y-0.5"
										aria-hidden="true"
									/>
								</button>
							) : (
								<CtaLink
									href={hero.ctaHref}
									onClick={() =>
										track({ name: "hero_cta_clicked", properties: { variant: "primary" } })
									}
								>
									{hero.ctaLabel}
								</CtaLink>
							)}

							{hero.ctaSecondaryHref && hero.ctaSecondaryLabel ? (
								<CtaLink
									href={hero.ctaSecondaryHref}
									variant="secondary"
									onClick={() =>
										track({
											name: "hero_cta_clicked",
											properties: { variant: "secondary" },
										})
									}
								>
									{hero.ctaSecondaryLabel}
								</CtaLink>
							) : null}
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
						<HeroProductPhoto image={heroProduct} className="lg:mt-[calc(1.75rem+1.5rem)]" />
					) : (
						<HeroProductPlaceholder className="lg:mt-[calc(1.75rem+1.5rem)]" />
					)}
				</div>
			</Container>
		</Section>
	);
}

function HeroProductPlaceholder({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"relative mx-auto flex aspect-4/5 w-full max-w-md flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-walnut/30 bg-foreground/[0.035] px-6 py-10 text-center lg:mx-0 lg:max-w-none",
				className,
			)}
			role="img"
			aria-label="Placeholder: zdjęcie produktu na hero — do uzupełnienia w panelu CMS (/magazyn/cms)"
		>
			<span aria-hidden="true" className="font-display text-3xl text-walnut/35">
				◆
			</span>
			<p className="max-w-56 text-pretty text-sm leading-relaxed text-foreground/55">
				Tu wyświetli się zdjęcie produktu — ustaw URL w panelu{" "}
				<span className="font-medium text-foreground/70">/magazyn/cms</span>.
			</p>
		</div>
	);
}

function HeroProductPhoto({ image, className }: { image: HeroProductImage; className?: string }) {
	return (
		<figure
			className={cn(
				"relative mx-auto aspect-[4/3] w-full max-w-[33.6rem] overflow-hidden rounded-2xl border border-walnut/15 shadow-card lg:mx-0 lg:max-w-none",
				className,
			)}
		>
			<Image
				src={image.src}
				alt={image.alt}
				fill
				className="object-cover"
				sizes="(min-width: 1024px) 41vw, min(26.4rem, 92vw)"
				priority
				fetchPriority="high"
			/>
		</figure>
	);
}
