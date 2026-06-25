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
import { getSiteSettings } from "@/lib/content";
import { STORE_INFO } from "@/components/layout/site-header/nav-data";
import { Breadcrumbs, Container, CtaLink, Eyebrow, Lead, Section } from "@/components/primitives";
import { CONTACT_FAST_RESPONSE, CONTACT_FORM_RESPONSE } from "@/lib/contact/response-time";
import { KontaktFormSection } from "./kontakt-form-section";
import { MapDirectionsLink, PhoneLink, WhatsAppLink } from "./contact-cta";

export const metadata: Metadata = {
	title: "Sklep z antykami w Nowym Targu — kontakt",
	description:
		`Napisz lub odwiedź sklep RetroHouse w Nowym Targu. Pytania o produkty, B2B, wysyłka — odpowiemy w ciągu ${CONTACT_FORM_RESPONSE.labelShort}.`,
	alternates: { canonical: "/kontakt" },
};

const FAQS = [
	{
		question: "Czy wysyłacie za granicę?",
		answer:
			"Aktualnie wysyłamy w Polsce. Indywidualne wysyłki do Czech, Słowacji i Niemiec — po kontakcie e-mailowym.",
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

export default async function KontaktPage() {
	const { socialLinks } = await getSiteSettings();
	const phoneHref = `tel:${STORE_INFO.phone.replace(/\s/g, "")}`;
	const whatsappHref = `https://wa.me/${STORE_INFO.whatsapp.replace(/\s|\+/g, "")}`;

	const localBusiness = {
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		"@id": "https://sklep-retrohouse.pl/#shop",
		name: STORE_INFO.name,
		url: "https://sklep-retrohouse.pl/",
		image: "https://sklep-retrohouse.pl/og-image.png",
		address: {
			"@type": "PostalAddress",
			streetAddress: STORE_INFO.streetAddress,
			postalCode: STORE_INFO.postalCode,
			addressLocality: STORE_INFO.city,
			addressRegion: "Małopolska",
			addressCountry: STORE_INFO.country,
		},
		geo: {
			"@type": "GeoCoordinates",
			latitude: STORE_INFO.geo.lat,
			longitude: STORE_INFO.geo.lng,
		},
		telephone: STORE_INFO.phone,
		email: STORE_INFO.email,
		openingHoursSpecification: [
			{
				"@type": "OpeningHoursSpecification",
				dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday"],
				opens: "11:00",
				closes: "18:00",
			},
			{
				"@type": "OpeningHoursSpecification",
				dayOfWeek: "Saturday",
				opens: "10:00",
				closes: "14:00",
			},
		],
		priceRange: "20–5000 PLN",
		sameAs: [socialLinks?.instagram, socialLinks?.facebook].filter(Boolean),
	};

	return (
		<main id="main" className="flex flex-col">
			<Section spacing="md" className="overflow-hidden bg-transparent !pt-10 md:!pt-12">
				<Container size="xl">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Kontakt" }]} />
					<div className="mt-8 max-w-3xl">
						<Eyebrow>Local SEO · Nowy Targ</Eyebrow>
						<h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.05]">
							Sklep z antykami w Nowym Targu — RetroHouse
						</h1>
						<Lead className="mt-4">
							Napisz do nas lub odwiedź nas osobiście. Gwarantujemy odpowiedź w ciągu{" "}
							{CONTACT_FORM_RESPONSE.label} — w godzinach otwarcia DM na Instagramie
							i&nbsp;WhatsApp odpisujemy {CONTACT_FAST_RESPONSE.within}.
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
								src={STORE_INFO.googleMapsEmbedSrc}
								className="absolute inset-0 size-full border-0"
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								allowFullScreen
							/>
						</div>
						<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-cream p-4 text-sm">
							<p className="text-foreground/80">
								<strong>Jak do nas dojechać:</strong> 4 minuty pieszo od rynku Nowego Targu, parking
								100 m. Wyznaczamy najlepszą trasę z Twojej lokalizacji.
							</p>
							<MapDirectionsLink
								href={STORE_INFO.mapsHref}
								className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground hover:text-terracotta"
							>
								Otwórz w Google Maps
								<ArrowRightIcon className="size-4" />
							</MapDirectionsLink>
						</div>
					</div>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="xl">
					<div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
						<KontaktFormSection />

						<aside className="space-y-4">
							<div className="rounded-2xl border border-border bg-card p-6">
								<Eyebrow>Dane kontaktowe</Eyebrow>
								<ul className="mt-4 space-y-3 text-sm">
									<ContactRow
										icon={<PinIcon className="size-4" />}
										label="Adres"
										value={`${STORE_INFO.streetAddress}, ${STORE_INFO.postalCode} ${STORE_INFO.city}`}
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
										href={phoneHref}
										kind="phone"
									/>
									<ContactRow
										icon={<WhatsAppIcon className="size-4" />}
										label="WhatsApp"
										value="szybka odpowiedź"
										href={whatsappHref}
										kind="whatsapp"
									/>
									{socialLinks?.instagram && (
										<ContactRow
											icon={<InstagramIcon className="size-4" />}
											label="Instagram"
											value={socialLinks.instagram}
											href={socialLinks.instagram}
										/>
									)}
								</ul>
							</div>

							<div className="rounded-2xl border border-border bg-cream p-6">
								<p className="font-display text-lg">Najszybsza droga</p>
								<p className="mt-1 text-sm text-foreground/70">
									{CONTACT_FAST_RESPONSE.openingHoursNote}
								</p>
							<div className="mt-4 flex flex-wrap items-center gap-2">
								{socialLinks?.instagram && (
									<CtaLink href={socialLinks.instagram} variant="secondary">
										DM na IG
									</CtaLink>
								)}
									<WhatsAppLink
										href={whatsappHref}
										className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-5 text-xs font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:border-terracotta hover:text-terracotta"
									>
										WhatsApp
									</WhatsAppLink>
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
								className="group/qa px-6 py-5 transition-colors open:bg-cream"
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
	kind,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	href?: string;
	kind?: "phone" | "whatsapp";
}) {
	const inner = (
		<div className="flex-1">
			<p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
				{label}
			</p>
			<p className="mt-0.5 text-foreground">{value}</p>
		</div>
	);

	if (!href) {
		return (
			<li className="flex items-start gap-3">
				<span className="mt-0.5 grid size-8 place-items-center rounded-full bg-cream text-brass">
					{icon}
				</span>
				{inner}
			</li>
		);
	}

	const linkClass = "flex-1 hover:text-terracotta";

	return (
		<li className="flex items-start gap-3">
			<span className="mt-0.5 grid size-8 place-items-center rounded-full bg-cream text-brass">
				{icon}
			</span>
			{kind === "phone" ? (
				<PhoneLink href={href} className={linkClass}>
					{inner}
				</PhoneLink>
			) : kind === "whatsapp" ? (
				<WhatsAppLink href={href} className={linkClass}>
					{inner}
				</WhatsAppLink>
			) : (
				<Link
					href={href}
					target={href.startsWith("http") ? "_blank" : undefined}
					rel={href.startsWith("http") ? "noreferrer" : undefined}
					className={linkClass}
				>
					{inner}
				</Link>
			)}
		</li>
	);
}
