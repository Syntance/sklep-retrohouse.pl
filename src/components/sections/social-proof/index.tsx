import Link from "next/link";
import { InstagramIcon, StarIcon } from "@/components/icons";
import { BrassRule, Container, Eyebrow, Section } from "@/components/primitives";
import { TESTIMONIALS } from "@/lib/mock/testimonials";

/**
 * Social proof — opinie z DM / IG / Google (po zgodzie klientki).
 *
 * Uczciwy stan pre-launch: gdy lista pusta, pokazujemy zaproszenie
 * do Instagrama (gdzie żyje rzeczywista społeczność) zamiast wymyślonych
 * opinii. To zgodne z brandbookiem („autentyczność > pozory dojrzałości").
 */
export function SocialProofSection() {
	const hasReviews = TESTIMONIALS.length > 0;

	return (
		<Section spacing="lg" tone="default">
			<Container size="lg">
				<header className="mb-10 flex flex-col items-center gap-3 text-center">
					<Eyebrow variant="script">co mówią</Eyebrow>
					<h2 className="max-w-xl font-display text-3xl font-medium leading-tight md:text-4xl">
						{hasReviews ? "Twoje listy po odbiorze paczki." : "Społeczność na Instagramie"}
					</h2>
					<BrassRule className="my-2 max-w-[140px]" />
				</header>

				{hasReviews ? <ReviewsGrid /> : <PreLaunchInvite />}
			</Container>
		</Section>
	);
}

function ReviewsGrid() {
	return (
		<>
			<p className="mb-6 text-center text-xs uppercase tracking-[0.16em] text-foreground/55">
				Opinie z DM Instagram, WhatsApp i Google · pisownia oryginalna
			</p>
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
							{testimonial.author} · {testimonial.location} ·{" "}
							{testimonial.source === "instagram"
								? "DM Instagram"
								: testimonial.source === "dm"
									? "WhatsApp"
									: testimonial.source === "google"
										? "opinia Google"
										: "wiadomość bezpośrednia"}
						</footer>
					</li>
				))}
			</ul>
		</>
	);
}

function PreLaunchInvite() {
	return (
		<div className="mx-auto max-w-3xl rounded-3xl border border-walnut/15 bg-card p-8 text-center shadow-card md:p-10">
			<p className="text-pretty text-base leading-relaxed text-foreground/80 md:text-lg">
				Pierwsze opinie zbieramy bezpośrednio od klientek, które otrzymały paczki w&nbsp;tym
				kwartale. Do&nbsp;tego czasu zapraszamy do&nbsp;społeczności na&nbsp;Instagramie —
				to&nbsp;tam pokazujemy, co&nbsp;dziś przywieźliśmy z&nbsp;Wiednia.
			</p>
			<Link
				href="https://instagram.com/retrohouse"
				target="_blank"
				rel="noreferrer"
				className="mt-6 inline-flex items-center gap-2 rounded-full border border-walnut/25 bg-background px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:border-terracotta hover:text-terracotta"
			>
				<InstagramIcon className="size-4" />
				@retrohouse
			</Link>
			<p className="mt-4 text-xs uppercase tracking-[0.14em] text-foreground/55">
				Po dostarczeniu paczki napiszemy z prośbą o opinię — zawsze za zgodą, zawsze anonimowo.
			</p>
		</div>
	);
}
