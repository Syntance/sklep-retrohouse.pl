"use client";

import {
	CompassIcon,
	HeartIcon,
	PackageIcon,
	PaletteIcon,
	PinIcon,
	ScrollIcon,
} from "@/components/icons";
import { BrassRule, Container, CtaLink, Eyebrow, Section } from "@/components/primitives";
import { useScrollDepth } from "@/lib/analytics/scroll-depth";

const STORY_STEPS = [
	{ icon: <PinIcon className="size-4" />, title: "Wiedeń", copy: "Pukamy do drzwi prywatnych kamienic." },
	{ icon: <ScrollIcon className="size-4" />, title: "Odkup", copy: "Bezpośrednio od właściciela — bez hurtowni." },
	{ icon: <CompassIcon className="size-4" />, title: "Selekcja", copy: "Tylko unikaty z udokumentowaną historią." },
	{ icon: <PackageIcon className="size-4" />, title: "Transport", copy: "Bibułka, ubezpieczenie, opieka nad każdą sztuką." },
	{ icon: <PaletteIcon className="size-4" />, title: "Nowy Targ", copy: "Inwentarz, opisy, fotografia w naturalnym świetle." },
	{ icon: <HeartIcon className="size-4" />, title: "Twój dom", copy: "Drugie życie — z kartą historii." },
];

/**
 * Story — 6-step proces (Notion: "Skąd to wszystko").
 * useScrollDepth(section: "story") emituje `story_section_scrolled`
 * gdy user widzi sekcję w 25/50/75/100%.
 */
export function StorySection() {
	const ref = useScrollDepth<HTMLDivElement>("story");

	return (
		<Section spacing="lg" id="historia">
			<Container size="lg">
				<div ref={ref} className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
					<div className="order-2 lg:order-1">
						<div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-walnut/15 shadow-card">
							<div
								aria-hidden="true"
								className="absolute inset-0"
								style={{
									backgroundImage:
										"radial-gradient(70% 60% at 30% 20%, oklch(0.92 0.04 80), transparent 60%), linear-gradient(160deg, oklch(0.78 0.04 70), oklch(0.39 0.07 45))",
								}}
							/>
							<div className="relative flex h-full items-end p-6">
								<p className="rounded-2xl border border-ink-foreground/30 bg-ink-foreground/25 p-5 font-display text-lg italic leading-snug text-ink backdrop-blur">
									Pukamy do drzwi prywatnych mieszkań. Słuchamy historii. Wybieramy najpiękniejsze
									przedmioty i przywozimy do Nowego Targu.
								</p>
							</div>
						</div>
					</div>

					<div className="order-1 lg:order-2">
						<Eyebrow>Skąd to wszystko</Eyebrow>
						<h2 className="mt-3 font-display text-3xl font-medium leading-tight md:text-4xl">
							Bezpośrednio od wiedeńczyków, prosto z&nbsp;ich kamienic.
						</h2>
						<p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-foreground/75">
							Pukamy do drzwi prywatnych mieszkań przy Ringstraße, w&nbsp;Leopoldstadt
							i&nbsp;na&nbsp;Mariahilf. Słuchamy historii, sprawdzamy sygnatury. Najpiękniejsze
							przedmioty ratujemy przed strychem albo śmietnikiem — i&nbsp;przywozimy do Nowego
							Targu z&nbsp;kartą pochodzenia.
						</p>

						<BrassRule className="my-8 max-w-[140px]" />

						<ol className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
							{STORY_STEPS.map((step, index) => (
								<li key={step.title} className="flex flex-col gap-1.5">
									<div className="flex items-center gap-2 text-terracotta">
										{step.icon}
										<span className="cta-text text-[0.65rem] text-foreground/55">
											{String(index + 1).padStart(2, "0")}
										</span>
									</div>
									<p className="font-display text-base font-medium leading-snug">{step.title}</p>
									<p className="text-sm text-foreground/65">{step.copy}</p>
								</li>
							))}
						</ol>

						<div className="mt-8 flex flex-wrap gap-3">
							<CtaLink href="/o-nas" variant="primary">
								Poznaj całą historię
							</CtaLink>
							<CtaLink href="/dla-projektantow" variant="ghost">
								Współpraca B2B
							</CtaLink>
						</div>
					</div>
				</div>
			</Container>
		</Section>
	);
}
