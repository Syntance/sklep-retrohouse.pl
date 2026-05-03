import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutProgress } from "@/components/checkout-progress";
import { ArrowRightIcon, GiftIcon, HeartIcon, InstagramIcon, PinIcon } from "@/components/icons";
import { STORE_INFO } from "@/components/layout/site-header/nav-data";
import { Container, CtaLink, Eyebrow, Section } from "@/components/primitives";

export const metadata: Metadata = {
	title: "Dziękujemy za zamówienie",
	description:
		"Zamówienie przyjęte. Pakujemy z należytą starannością — bibułka, karta z historią, wizytówka.",
	robots: { index: false, follow: false },
};

type SearchParams = Promise<{ order?: string }>;

export default async function ThankYouPage({ searchParams }: { searchParams: SearchParams }) {
	const params = await searchParams;
	const orderId = params.order ?? "—";

	return (
		<main id="main" className="flex flex-col">
			<Section spacing="md">
				<Container size="md">
					<CheckoutProgress step={4} />
					<div className="mt-8">
						<Eyebrow>Krok 4 z 4 · Gotowe</Eyebrow>
						<h1 className="mt-3 font-display text-5xl font-semibold leading-tight md:text-6xl">
							Dziękujemy za zamówienie!
						</h1>
						<p className="mt-4 max-w-2xl text-pretty text-lg text-foreground/80">
							Numer zamówienia <span className="tabular font-semibold">#{orderId}</span> trafił do
							naszej skrzynki. W ciągu 2 godzin roboczych odeślemy maila z potwierdzeniem i numerem
							śledzenia.
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
						<div className="rounded-2xl border border-border bg-cream p-5">
							<div className="flex items-start gap-3">
								<span className="grid size-10 place-items-center rounded-full bg-terracotta text-terracotta-foreground">
									<GiftIcon className="size-5" />
								</span>
								<div>
									<p className="font-display text-lg">Wrzuć zdjęcie z otwarcia paczki</p>
									<p className="mt-1 text-sm text-foreground/70">
										Oznacz <strong>@retrohouse</strong> na IG, a my odpowiemy kodem rabatowym -10%
										na kolejne zakupy.
									</p>
								</div>
							</div>
							<Link
								href={STORE_INFO.instagramHref}
								target="_blank"
								rel="noreferrer"
								className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground hover:text-terracotta"
							>
								<InstagramIcon className="size-4" />
								Otwórz Instagrama
							</Link>
						</div>
					</div>

					<form
						action="/api/newsletter"
						method="post"
						className="mt-6 flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-6 md:flex-row md:items-end md:p-8"
					>
						<div className="flex-1">
							<p className="font-display text-2xl">Chcesz wiedzieć o nowych dostawach z Wiednia?</p>
							<p className="mt-1 text-sm text-foreground/70">
								Maila wysyłamy raz na 2 tygodnie. Bez spamu, z linkiem do priorytetowej rezerwacji.
							</p>
						</div>
						<label className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
							<span className="sr-only">E-mail</span>
							<input
								type="email"
								name="email"
								required
								autoComplete="email"
								placeholder="twój e-mail"
								className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm focus-visible:border-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
							/>
							<button
								type="submit"
								className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-terracotta px-5 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground"
							>
								Zapisz mnie
								<ArrowRightIcon className="size-4" />
							</button>
						</label>
					</form>
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
						<Link
							href={STORE_INFO.mapsHref}
							target="_blank"
							rel="noreferrer"
							className="group/card flex h-full flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-terracotta"
						>
							<div className="flex items-center gap-2 text-brass">
								<PinIcon className="size-5" />
								<span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
									Odbiór osobisty?
								</span>
							</div>
							<p className="font-display text-2xl">Zostaw opinię w Google</p>
							<p className="text-sm text-foreground/70">
								30 sekund — pomożesz innym znaleźć nasz sklep w Nowym Targu.
							</p>
							<span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
								Otwórz wizytówkę
								<ArrowRightIcon className="size-4 transition-transform group-hover/card:translate-x-0.5" />
							</span>
						</Link>
					</div>

					<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
						<CtaLink href="/sklep" variant="secondary" withArrow={false}>
							Wróć do sklepu
						</CtaLink>
						<Link
							href={STORE_INFO.instagramHref}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/70 hover:text-terracotta"
						>
							<InstagramIcon className="size-4" />
							@retrohouse
						</Link>
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
