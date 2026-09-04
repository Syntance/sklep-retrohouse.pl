import type { Metadata } from "next";
import { CompassIcon } from "@/components/icons";
import { Container, CtaLink, Eyebrow, Section } from "@/components/primitives";

export const metadata: Metadata = {
	title: "Strona nie znaleziona",
	robots: { index: false, follow: false },
};

export default function NotFoundPage() {
	return (
		<main id="main" className="flex flex-col">
			<Section spacing="lg" tone="cream" className="flex-1">
				<Container size="md">
					<div className="mx-auto flex max-w-xl flex-col items-center text-center">
						<span
							aria-hidden
							className="grid size-16 place-items-center rounded-full border border-walnut/20 bg-card text-brass shadow-card"
						>
							<CompassIcon className="size-7" />
						</span>

						<Eyebrow className="mt-8 justify-center">404</Eyebrow>

						<h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,3.75rem)] font-semibold leading-[1.05] text-foreground">
							Ten skarb zaginął w labiryncie.
						</h1>

						<p className="mt-4 max-w-md text-base leading-relaxed text-foreground/70">
							Strona, której szukasz, nie istnieje albo została przeniesiona. Może to unikat, który
							ktoś zdążył kupić przed Tobą.
						</p>

						<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
							<CtaLink href="/">Wróć na stronę główną</CtaLink>
							<CtaLink href="/sklep" variant="secondary">
								Przeglądaj sklep
							</CtaLink>
						</div>

						<p className="mt-10 text-sm text-foreground/55">
							Szukasz czegoś konkretnego?{" "}
							<CtaLink href="/kontakt" variant="ghost" withArrow={false} className="inline-flex">
								Napisz do nas
							</CtaLink>
						</p>
					</div>
				</Container>
			</Section>
		</main>
	);
}
