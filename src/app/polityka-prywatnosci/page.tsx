import type { Metadata } from "next";
import { Breadcrumbs, Container, Eyebrow, Section } from "@/components/primitives";
import { LEGAL_DOCUMENT_CONTACT } from "@/components/sections/legal-document-contact/presets";
import { LegalDocumentContactSection } from "@/components/sections/legal-document-contact/section";
import { EMAIL_CONTACT } from "@/lib/email/constants";

export const metadata: Metadata = {
	title: "Polityka prywatności",
	description:
		"Jak przetwarzamy Twoje dane osobowe — RODO, retencja, kontakt z DPO. Zgodne z ustawą o prawach konsumenta.",
	robots: { index: true, follow: true },
};

const SECTIONS = [
	{
		title: "1. Administrator danych",
		copy: `Administratorem danych osobowych jest RetroHouse z siedzibą w Nowym Targu. Kontakt: ${EMAIL_CONTACT}. W sprawach RODO współpracujemy z zewnętrznym Inspektorem Ochrony Danych (DPO).`,
	},
	{
		title: "2. Cele przetwarzania",
		copy: `Twoje dane przetwarzamy w celu: (a) realizacji zamówień (art. 6 ust. 1 lit. b RODO), (b) prowadzenia konta klienta, (c) marketingu bezpośredniego (zgoda — art. 6 ust. 1 lit. a), (d) wystawiania faktur (obowiązek prawny — art. 6 ust. 1 lit. c).`,
	},
	{
		title: "3. Zakres danych",
		copy: `Imię, nazwisko, e-mail, telefon, adres dostawy, NIP (B2B), historia zamówień. Nie zbieramy danych wrażliwych. Płatności obsługiwane przez Przelewy24 — nie mamy dostępu do danych karty.`,
	},
	{
		title: "4. Retencja danych",
		copy: `Faktury — 5 lat (Ordynacja podatkowa, art. 70). Konta klientów — do momentu usunięcia konta lub 3 lata bezczynności. Logi bezpieczeństwa — 12 miesięcy. Dane marketingowe — do wycofania zgody.`,
	},
	{
		title: "5. Twoje prawa (DSR)",
		copy: `Masz prawo do: dostępu (art. 15), sprostowania (16), usunięcia / „prawa do bycia zapomnianym" (17), ograniczenia przetwarzania (18), przenoszenia danych (20), sprzeciwu (21). Realizacja przez /moje-konto/prywatnosc lub e-mail ${EMAIL_CONTACT}. Termin: 30 dni.`,
	},
	{
		title: "6. Powierzenie danych",
		copy: `Korzystamy z procesorów na podstawie DPA: Vercel (hosting), Resend (mailing), Sentry (monitoring), PostHog (analityka), Stripe / Przelewy24 (płatności), InPost / DPD / DHL (wysyłka). Pełna lista i kraj przetwarzania — na życzenie.`,
	},
	{
		title: "7. Cookies i analityka",
		copy: `Używamy cookies i pikseli analitycznych zgodnie z Prawem Telekomunikacyjnym (art. 173). Zgoda zbierana banerem (Akceptuj / Odrzuć / Dostosuj). Bez zgody działają tylko cookies niezbędne. Szczegóły w sekcji /cookies.`,
	},
	{
		title: "8. Prawo do skargi",
		copy: `Skargę dotyczącą przetwarzania danych możesz złożyć do Prezesa UODO — uodo.gov.pl.`,
	},
	{
		title: "9. Zmiany polityki",
		copy: `Każda istotna zmiana polityki — komunikacja e-mailowa do osób zapisanych. Aktualna wersja zawsze pod /polityka-prywatnosci. Wersja: ${new Date().toLocaleDateString("pl-PL")}.`,
	},
];

export default function PolitykaPage() {
	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="md">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Polityka prywatności" }]} />
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<Eyebrow>RODO · Dane osobowe</Eyebrow>
					<h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.05]">
						Polityka prywatności
					</h1>
					<p className="mt-4 max-w-2xl text-foreground/70">
						Wersja z dnia {new Date().toLocaleDateString("pl-PL")}. Roboczy szkielet — finalna treść
						po audycie radcy prawnego.
					</p>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<ol className="space-y-8">
						{SECTIONS.map((section) => (
							<li key={section.title}>
								<h2 className="font-display text-2xl font-semibold leading-tight">
									{section.title}
								</h2>
								<p className="mt-2 text-foreground/80 leading-relaxed">{section.copy}</p>
							</li>
						))}
					</ol>
				</Container>
			</Section>

			<LegalDocumentContactSection {...LEGAL_DOCUMENT_CONTACT.privacy} />
		</main>
	);
}
