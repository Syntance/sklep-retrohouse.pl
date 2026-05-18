"use client";

import { Container, Section } from "@/components/primitives";
import { useScrollDepth } from "@/lib/analytics/scroll-depth";

const STEPS = [
	{ label: "Odkup", copy: "Bezpośrednio od właścicieli wiedeńskich mieszkań." },
	{ label: "Transport", copy: "Bibułka, ubezpieczenie, 480 km do Nowego Targu." },
	{ label: "Nowy Targ", copy: "Atrybucja, opisy i wysyłka w 48 h." },
] as const;

/**
 * Story — sekcja pochodzenia.
 * Eyebrow → H2 → sub → 3-punktowa oś procesu.
 */
export function StorySection() {
	const ref = useScrollDepth<HTMLDivElement>("story");

	return (
		<Section
			id="historia"
			tone="paper"
			aria-labelledby="story-heading"
			className="py-20 md:py-28"
		>
			<Container size="md">
				<div ref={ref} className="flex flex-col items-center gap-14 text-center">

					{/* ── Nagłówek ─────────────────────────────────────────── */}
					<div className="flex flex-col items-center gap-4">
						<span className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.25em] text-terracotta">
							Skąd pochodzą nasze antyki
						</span>

						<h2
							id="story-heading"
							className="font-display text-4xl font-medium leading-[1.15] tracking-tight text-paper-foreground md:text-5xl"
						>
							Z prywatnych mieszkań w Wiedniu.
							<br />
							Prosto do Twojego domu.
						</h2>

						<p className="max-w-sm text-pretty text-base leading-relaxed text-paper-foreground/60">
							Bez hurtowni, bez pośredników, bez aukcji.
						</p>
					</div>

					{/* ── Oś procesu — desktop ─────────────────────────────── */}
					<div className="hidden w-full md:block" aria-hidden="true">
						{/* Kropki + linia */}
						<div className="relative flex items-center justify-between">
							<div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-walnut/20" />
							{STEPS.map((s) => (
								<span
									key={s.label}
									className="relative z-10 size-2.5 shrink-0 rounded-full bg-brass/80 ring-[6px] ring-paper"
								/>
							))}
						</div>

						{/* Etykiety */}
						<div className="mt-7 grid grid-cols-3">
							{STEPS.map((s) => (
								<div key={s.label} className="flex flex-col items-center gap-2 px-6">
									<p className="font-display text-xl font-semibold text-paper-foreground">
										{s.label}
									</p>
									<p className="text-pretty text-sm leading-snug text-paper-foreground/60">
										{s.copy}
									</p>
								</div>
							))}
						</div>
					</div>

					{/* ── Oś procesu — mobile ──────────────────────────────── */}
					<ol className="w-full md:hidden" aria-label="Odkup, transport, Nowy Targ">
						{STEPS.map((s) => (
							<li
								key={s.label}
								className="flex items-start gap-4 py-4 text-left [&+&]:border-t [&+&]:border-walnut/15"
							>
								<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brass/80" aria-hidden="true" />
								<div>
									<p className="font-display text-base font-semibold text-paper-foreground">
										{s.label}
									</p>
									<p className="mt-0.5 text-sm leading-snug text-paper-foreground/60">{s.copy}</p>
								</div>
							</li>
						))}
					</ol>

				</div>
			</Container>
		</Section>
	);
}
