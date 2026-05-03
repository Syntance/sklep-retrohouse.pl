import type { Metadata } from "next";
import Link from "next/link";
import {
	ArrowRightIcon,
	ClockIcon,
	InstagramIcon,
	MailIcon,
	PhoneIcon,
	PinIcon,
	WhatsAppIcon,
} from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { STORE_INFO } from "@/components/layout/site-header/nav-data";
import { Breadcrumbs, Container, CtaLink, Eyebrow, Lead, Section } from "@/components/primitives";

export const metadata: Metadata = {
	title: "Sklep z antykami w Nowym Targu — kontakt",
	description:
		"Napisz lub odwiedź sklep RetroHouse w Nowym Targu. Pytania o produkty, B2B, wysyłka — odpowiemy w ciągu 12 godzin.",
	alternates: { canonical: "/kontakt" },
};

const FAQS = [
	{
		question: "Czy wysyłacie za granicę?",
		answer:
			"Aktualnie wysyłamy w Polsce. Indywidualne wysyłki do Czech, Słowacji i Niemiec — po kontakcie mailowym.",
	},
	{
		question: "Czy mogę zarezerwować przedmiot?",
		answer:
			"Tak — na 24 h dla klientów indywidualnych i do 14 dni dla projektantów (po wysłaniu briefu B2B).",
	},
	{
		question: "Jak wygląda pakowanie?",
		answer:
			"Bibułka, ubezpieczona przesyłka, karta historii i wizytówka RetroHouse. Pakowanie prezentowe za dodatkowe 25 zł.",
	},
	{
		question: "Czy mogę przyjechać i obejrzeć przedmioty?",
		answer:
			"Tak. Sklep w Nowym Targu jest otwarty wt–pt 11:00–18:00 i sob 10:00–14:00. Polecamy wcześniejszy kontakt.",
	},
];

export default function KontaktPage() {
	const localBusiness = {
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		name: STORE_INFO.name,
		address: {
			"@type": "PostalAddress",
			addressLocality: "Nowy Targ",
			addressRegion: "Małopolska",
			addressCountry: "PL",
		},
		telephone: STORE_INFO.phone,
		email: STORE_INFO.email,
		openingHours: ["Tu-Fr 11:00-18:00", "Sa 10:00-14:00"],
		priceRange: "20–5000 PLN",
		url: "/",
	};

	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="xl">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Kontakt" }]} />
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="xl">
					<div className="max-w-3xl">
						<Eyebrow>Local SEO · Nowy Targ</Eyebrow>
						<h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.05]">
							Sklep z antykami w Nowym Targu — RetroHouse
						</h1>
						<Lead className="mt-4">
							Napisz do nas lub odwiedź nas osobiście. Odpowiadamy w ciągu 12 godzin (średnia z
							ostatnich 30 dni).
						</Lead>
					</div>
				</Container>
			</Section>

			<Section spacing="md" bleed className="pb-12">
				<Container size="xl">
					<div className="overflow-hidden rounded-3xl border border-border bg-card shadow-md">
						<div className="relative aspect-[16/7] w-full">
							<iframe
								title="Lokalizacja sklepu RetroHouse w Nowym Targu"
								src="https://www.google.com/maps?q=Nowy+Targ&output=embed"
								className="absolute inset-0 size-full border-0"
								loading="lazy"
								allowFullScreen
							/>
						</div>
						<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/40 p-4 text-sm">
							<p className="text-foreground/80">
								<strong>Jak do nas dojechać:</strong> 4 minuty pieszo od rynku Nowego Targu, parking
								100 m. Wyznaczamy najlepszą trasę z Twojej lokalizacji.
							</p>
							<Link
								href={STORE_INFO.mapsHref}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground hover:text-brass"
							>
								Otwórz w Google Maps
								<ArrowRightIcon className="size-4" />
							</Link>
						</div>
					</div>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="xl">
					<div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
						<form
							action="/api/contact"
							method="post"
							className="rounded-3xl border border-border bg-card p-6 md:p-8"
						>
							<Eyebrow>Formularz kontaktowy</Eyebrow>
							<h2 className="mt-3 font-display text-3xl font-semibold leading-tight">
								Napisz do nas
							</h2>
							<p className="mt-2 max-w-xl text-foreground/70">
								Odpowiadamy w 12 godzin roboczych. W weekendy i święta — w poniedziałek rano.
							</p>

							<div className="mt-6 grid gap-4 sm:grid-cols-2">
								<TextField label="Imię" name="name" required />
								<TextField label="E-mail" name="email" type="email" required />
								<label className="sm:col-span-2">
									<span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
										Temat *
									</span>
									<select
										name="topic"
										required
										className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:border-brass focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
										defaultValue=""
									>
										<option value="" disabled>
											Wybierz…
										</option>
										<option value="produkt">Pytanie o produkt</option>
										<option value="b2b">Współpraca B2B</option>
										<option value="wysylka">Wysyłka i zwroty</option>
										<option value="inne">Inne</option>
									</select>
								</label>
								<label className="sm:col-span-2">
									<span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
										Wiadomość *
									</span>
									<textarea
										name="message"
										rows={5}
										required
										minLength={20}
										placeholder="Napisz, czego szukasz — dopasujemy z najnowszej dostawy z Wiednia."
										className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:border-brass focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
									/>
								</label>
							</div>

							<button
								type="submit"
								className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold uppercase tracking-[0.16em] text-background"
							>
								Wyślij
								<ArrowRightIcon className="size-4" />
							</button>

							<p className="mt-3 text-xs text-foreground/60">
								Wysyłając formularz akceptujesz{" "}
								<Link
									href="/polityka-prywatnosci"
									className="underline underline-offset-4 hover:text-brass"
								>
									politykę prywatności
								</Link>
								.
							</p>

							<aside className="mt-6 rounded-2xl border border-brass/40 bg-brass/15 p-4 text-sm">
								<p className="font-display text-base">Jesteś projektantem wnętrz / architektem?</p>
								<p className="mt-1 text-foreground/80">
									Przejdź na{" "}
									<Link
										href="/dla-projektantow"
										className="font-semibold text-foreground underline underline-offset-4 hover:text-brass"
									>
										/dla-projektantow
									</Link>
									— tam jest dedykowany formularz briefu B2B (mood board, budżet, termin, rezerwacja
									14 dni). Odpowiemy szybciej niż tutaj.
								</p>
							</aside>
						</form>

						<aside className="space-y-4">
							<div className="rounded-2xl border border-border bg-card p-6">
								<Eyebrow>Dane kontaktowe</Eyebrow>
								<ul className="mt-4 space-y-3 text-sm">
									<ContactRow
										icon={<PinIcon className="size-4" />}
										label="Adres"
										value={STORE_INFO.address}
									/>
									<ContactRow
										icon={<ClockIcon className="size-4" />}
										label="Godziny otwarcia"
										value={STORE_INFO.hours}
									/>
									<ContactRow
										icon={<MailIcon className="size-4" />}
										label="E-mail"
										value={STORE_INFO.email}
										href={`mailto:${STORE_INFO.email}`}
									/>
									<ContactRow
										icon={<PhoneIcon className="size-4" />}
										label="Telefon"
										value={STORE_INFO.phone}
										href={`tel:${STORE_INFO.phone.replace(/\s/g, "")}`}
									/>
									<ContactRow
										icon={<WhatsAppIcon className="size-4" />}
										label="WhatsApp"
										value="szybka odpowiedź"
										href={`https://wa.me/${STORE_INFO.whatsapp.replace(/\s|\+/g, "")}`}
									/>
									<ContactRow
										icon={<InstagramIcon className="size-4" />}
										label="Instagram"
										value={STORE_INFO.instagram}
										href={STORE_INFO.instagramHref}
									/>
								</ul>
							</div>

							<div className="rounded-2xl border border-border bg-secondary/40 p-6">
								<p className="font-display text-lg">Najszybsza droga</p>
								<p className="mt-1 text-sm text-foreground/70">
									DM na Instagramie albo WhatsApp — odpisujemy w godzinach otwarcia w ciągu 30
									minut.
								</p>
								<div className="mt-4 flex flex-wrap items-center gap-2">
									<CtaLink href={STORE_INFO.instagramHref} variant="secondary">
										DM na IG
									</CtaLink>
									<CtaLink
										href={`https://wa.me/${STORE_INFO.whatsapp.replace(/\s|\+/g, "")}`}
										variant="ghost"
									>
										WhatsApp
									</CtaLink>
								</div>
							</div>
						</aside>
					</div>
				</Container>
			</Section>

			<Section spacing="md" tone="muted">
				<Container size="md">
					<Eyebrow>FAQ</Eyebrow>
					<h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
						Najczęstsze pytania
					</h2>
					<dl className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
						{FAQS.map((faq) => (
							<details
								key={faq.question}
								className="group/qa px-6 py-5 transition-colors open:bg-secondary/40"
							>
								<summary className="flex cursor-pointer items-center justify-between gap-3 text-left">
									<dt className="font-display text-lg">{faq.question}</dt>
									<span
										aria-hidden
										className="text-2xl font-light leading-none text-brass transition-transform group-open/qa:rotate-45"
									>
										+
									</span>
								</summary>
								<dd className="mt-3 text-sm leading-relaxed text-foreground/80">{faq.answer}</dd>
							</details>
						))}
					</dl>
				</Container>
			</Section>

			<JsonLd data={localBusiness} id="local-business-jsonld" />
		</main>
	);
}

function ContactRow({
	icon,
	label,
	value,
	href,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	href?: string;
}) {
	const inner = (
		<div className="flex-1">
			<p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
				{label}
			</p>
			<p className="mt-0.5 text-foreground">{value}</p>
		</div>
	);
	return (
		<li className="flex items-start gap-3">
			<span className="mt-0.5 grid size-8 place-items-center rounded-full bg-secondary text-brass">
				{icon}
			</span>
			{href ? (
				<Link
					href={href}
					target={href.startsWith("http") ? "_blank" : undefined}
					rel={href.startsWith("http") ? "noreferrer" : undefined}
					className="flex-1 hover:text-brass"
				>
					{inner}
				</Link>
			) : (
				inner
			)}
		</li>
	);
}

function TextField({
	label,
	name,
	type = "text",
	required,
}: {
	label: string;
	name: string;
	type?: string;
	required?: boolean;
}) {
	const id = `field-${name}`;
	return (
		<label htmlFor={id}>
			<span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
				{label} {required ? <span aria-hidden>*</span> : null}
			</span>
			<input
				id={id}
				name={name}
				type={type}
				required={required}
				className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:border-brass focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
			/>
		</label>
	);
}
