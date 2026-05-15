import { StarIcon } from "@/components/icons";
import { BrassRule, Container, Eyebrow, Section } from "@/components/primitives";
import { TESTIMONIALS } from "@/lib/mock/testimonials";

/**
 * Social proof — 3 opinie, ton "Na Ty" (brandbook 2026-05-03).
 * Statyczna sekcja, brak instrumentacji (scroll_depth section: 'social_proof'
 * lecia z parent Story — homepage nie potrzebuje per-card eventu).
 */
export function SocialProofSection() {
	return (
		<Section spacing="lg" tone="default">
			<Container size="lg">
				<header className="mb-10 flex flex-col items-center gap-3 text-center">
					<Eyebrow variant="script">co mówią</Eyebrow>
					<h2 className="max-w-xl font-display text-3xl font-medium leading-tight md:text-4xl">
						Twoje listy po odbiorze paczki.
					</h2>
					<BrassRule className="my-2 max-w-[140px]" />
				</header>

				<ul className="grid gap-5 md:grid-cols-3">
					{TESTIMONIALS.map((testimonial) => (
						<li
							key={testimonial.id}
							className="flex h-full flex-col gap-4 rounded-2xl border border-walnut/15 bg-card p-6 shadow-card"
						>
							<div
								role="img"
								aria-label={`Ocena: ${testimonial.rating} na 5`}
								className="flex gap-1 text-terracotta"
							>
								{Array.from({ length: 5 }, (_, i) => (
									<StarIcon
										// biome-ignore lint/suspicious/noArrayIndexKey: gwiazdki to czysta dekoracja
										key={`star-${testimonial.id}-${i}`}
										className="size-4 fill-current"
										aria-hidden="true"
									/>
								))}
							</div>
							<blockquote className="flex-1 text-pretty font-display text-lg leading-snug text-foreground">
								„{testimonial.body}"
							</blockquote>
							<footer className="cta-text text-xs text-foreground/55">
								{testimonial.author} · {testimonial.location}
							</footer>
						</li>
					))}
				</ul>
			</Container>
		</Section>
	);
}
