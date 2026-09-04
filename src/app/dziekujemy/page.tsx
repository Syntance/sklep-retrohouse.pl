import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutProgress } from "@/components/checkout-progress";
import { ArrowRightIcon, HeartIcon, InstagramIcon } from "@/components/icons";
import { STORE_INFO } from "@/components/layout/site-header/nav-data";
import { NewsletterForm } from "@/components/newsletter-form";
import { Container, CtaLink, Eyebrow, Section } from "@/components/primitives";
import { getSiteSettings } from "@/lib/content";
import { PurchaseTracker, ReviewCard, UgcCtaCard } from "./thank-you-tracking";

export const metadata: Metadata = {
	title: "Dziękujemy za zamówienie",
	description:
		"Zamówienie przyjęte. Pakujemy z należytą starannością — bibułka, karta z historią, wizytówka.",
	robots: { index: false, follow: false },
};

type SearchParams = Promise<{ order?: string; value?: string; items?: string }>;

export default async function ThankYouPage({ searchParams }: { searchParams: SearchParams }) {
	const params = await searchParams;
	const orderId = params.order ?? "—";
	const value = Number.parseFloat(params.value ?? "0");
	const itemsCount = Number.parseInt(params.items ?? "0", 10);
	const { socialLinks } = await getSiteSettings();

	return (
		<main id="main" className="flex flex-col">
			{orderId !== "—" ? (
				<PurchaseTracker
					orderId={orderId}
					value={Number.isFinite(value) ? value : 0}
					itemsCount={Number.isFinite(itemsCount) ? itemsCount : 0}
				/>
			) : null}

			<Section spacing="md">
				<Container size="md">
					<CheckoutProgress step={3} />
					<div className="mt-8">
						<Eyebrow>Krok 3 z 3 · Gotowe</Eyebrow>
						<h1 className="mt-3 font-display text-5xl font-semibold leading-tight md:text-6xl">
							Dziękujemy za zamówienie!
						</h1>
						<p className="mt-4 max-w-2xl text-pretty text-lg text-foreground/80">
							Numer zamówienia <span className="tabular font-semibold">#{orderId}</span> trafił do
							naszej skrzynki. W ciągu 2 godzin roboczych odeślemy e-maila z potwierdzeniem i
							numerem śledzenia.
						</p>
					</div>
				</Container>
			</Section>

			<Section spacing="md" tone="muted">
				<Container size="md">
					<div className="grid gap-6 rounded-3xl border border-border bg-card p-6 md:grid-cols-2 md:p-10">
						<div>
							<p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
								Co się teraz dzieje
							</p>
							<ol className="mt-4 space-y-3 text-sm">
								<TimelineStep
									label="Pakujemy"
									description="Bibułka, karta z historią przedmiotu, wizytówka RetroHouse."
								/>
								<TimelineStep
									label="Wysyłamy"
									description="Ubezpieczona przesyłka z numerem śledzenia (2–3 dni)."
								/>
								<TimelineStep
									label="Otwierasz"
									description="Premium unboxing — udostępnij na IG i odbierz 10% rabatu."
								/>
							</ol>
						</div>
						{socialLinks?.instagram && <UgcCtaCard href={socialLinks.instagram} />}
					</div>

					<div className="mt-6">
						<NewsletterForm
							source="popup"
							heading="Chcesz wiedzieć o nowych dostawach z Wiednia?"
							description="E-maila wysyłamy raz na 2 tygodnie. Bez spamu, z linkiem do priorytetowej rezerwacji."
						/>
					</div>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<div className="grid gap-4 md:grid-cols-2">
						<Link
							href="/o-nas"
							className="group/card flex h-full flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-terracotta"
						>
							<div className="flex items-center gap-2 text-brass">
								<HeartIcon className="size-5" />
								<span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
									Pierwsze zakupy?
								</span>
							</div>
							<p className="font-display text-2xl">Poznaj nas</p>
							<p className="text-sm text-foreground/70">
								Zobacz, jak pukamy do drzwi wiedeńskich kamienic, by wybrać przedmioty, które
								trafiły do Twojego zamówienia.
							</p>
							<span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
								Otwórz historię
								<ArrowRightIcon className="size-4 transition-transform group-hover/card:translate-x-0.5" />
							</span>
						</Link>
						<ReviewCard href={STORE_INFO.googleReviewsHref} />
					</div>

					<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
						<CtaLink href="/sklep" variant="secondary" withArrow={false}>
							Wróć do sklepu
						</CtaLink>
						{socialLinks?.instagram && (
							<Link
								href={socialLinks.instagram}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/70 hover:text-terracotta"
							>
								<InstagramIcon className="size-4" />
								@retrohouse
							</Link>
						)}
					</div>
				</Container>
			</Section>
		</main>
	);
}

function TimelineStep({ label, description }: { label: string; description: string }) {
	return (
		<li className="flex items-start gap-3">
			<span className="mt-1 size-2 shrink-0 rounded-full bg-terracotta" />
			<div>
				<p className="font-semibold">{label}</p>
				<p className="text-sm text-foreground/70">{description}</p>
			</div>
		</li>
	);
}
