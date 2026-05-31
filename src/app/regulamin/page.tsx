import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, Container, Eyebrow, Section } from "@/components/primitives";

export const metadata: Metadata = {
	title: "Regulamin sklepu",
	description:
		"Regulamin sklepu internetowego RetroHouse. Zgodny z ustawą o prawach konsumenta i Dyrektywą Omnibus.",
	robots: { index: true, follow: true },
};

const SECTIONS = [
	{
		title: "1. Postanowienia ogólne",
		copy: `Niniejszy regulamin określa zasady korzystania ze sklepu internetowego RetroHouse dostępnego pod adresem sklep-retrohouse.pl. Sklep prowadzi sprzedaż detaliczną oraz B2B na rzecz konsumentów (UPK), konsumentów-przedsiębiorców i przedsiębiorców (KC).`,
	},
	{
		title: "2. Definicje",
		copy: `Użytkownik, Konsument, Przedsiębiorca-Konsument, Sprzedawca, Towar, Zamówienie, Umowa Sprzedaży, Dni Robocze — definicje zgodnie z ustawą o prawach konsumenta z 30 maja 2014.`,
	},
	{
		title: "3. Składanie zamówienia",
		copy: `Zamówienie składa się przez dodanie produktów do koszyka, podanie danych dostawy, wybór sposobu wysyłki i płatności oraz akceptację regulaminu i polityki prywatności. Każdy przedmiot to unikat — po dodaniu do koszyka zostaje zarezerwowany na 15 minut.`,
	},
	{
		title: "4. Ceny i płatności",
		copy: `Ceny w sklepie podane są w PLN i zawierają podatek VAT (procedura marży dla przedmiotów używanych — art. 120 UPTU). Płatność: Przelewy24 (BLIK, karta, szybki przelew) lub przelew tradycyjny dla B2B (termin 14 dni od FV). Zgodnie z Dyrektywą Omnibus przy każdej obniżce ceny prezentujemy najniższą cenę z 30 dni przed obniżką.`,
	},
	{
		title: "5. Wysyłka",
		copy: `Realizujemy wysyłkę przez InPost Paczkomaty (2–3 dni), kuriera DPD/DHL (1–2 dni) lub odbiór osobisty w Nowym Targu (tego samego dnia). Każda przesyłka jest ubezpieczona. Szczegóły na stronie /wysylka.`,
	},
	{
		title: "6. Prawo odstąpienia od umowy",
		copy: `Konsument ma prawo odstąpić od umowy w terminie 14 dni od dostawy bez podania przyczyny — zgodnie z art. 27 UPK. Formularz odstąpienia dostępny w stopce każdego e-maila z potwierdzeniem zamówienia.`,
	},
	{
		title: "7. Reklamacje",
		copy: `Reklamacje rozpatrujemy w terminie 14 dni od zgłoszenia. W przypadku uszkodzenia podczas transportu — zgłoszenie ze zdjęciami w ciągu 24 h od dostawy. Wymieniamy lub zwracamy pieniądze (ubezpieczenie przesyłki).`,
	},
	{
		title: "8. Dane osobowe",
		copy: `Administratorem danych jest RetroHouse. Szczegóły przetwarzania danych — w polityce prywatności pod adresem /polityka-prywatnosci.`,
	},
	{
		title: "9. Postanowienia końcowe",
		copy: `W sprawach nieuregulowanych zastosowanie mają przepisy KC, UPK, RODO oraz ustawy o świadczeniu usług drogą elektroniczną. Wersja regulaminu z dnia: ${new Date().toLocaleDateString("pl-PL")}.`,
	},
];

export default function RegulaminPage() {
	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="md">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Regulamin" }]} />
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<Eyebrow>Dokumenty prawne</Eyebrow>
					<h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.05]">
						Regulamin sklepu
					</h1>
					<p className="mt-4 max-w-2xl text-foreground/70">
						Wersja z dnia {new Date().toLocaleDateString("pl-PL")}. Roboczy szkielet — finalna treść
						po konsultacji z radcą prawnym (zgodność z UPK, Omnibus, DSA, RODO).
					</p>

					<aside className="mt-6 rounded-2xl border border-brass/40 bg-terracotta/15 p-5 text-sm">
						<p className="font-display text-base">Wersja robocza</p>
						<p className="mt-1 text-foreground/80">
							Strona służy jako szablon. Pełną treść regulaminu dostarczymy po finalnym audycie
							prawnym (zgodnie z 56-legal.mdc).
						</p>
					</aside>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<ol className="space-y-8">
						{SECTIONS.map((section) => (
							<li key={section.title} id={slugify(section.title)}>
								<h2 className="font-display text-2xl font-semibold leading-tight">
									{section.title}
								</h2>
								<p className="mt-2 text-foreground/80 leading-relaxed">{section.copy}</p>
							</li>
						))}
					</ol>
				</Container>
			</Section>

			<Section spacing="md" tone="muted">
				<Container size="md">
					<div className="rounded-3xl border border-border bg-card p-8 md:p-12">
						<h2 className="font-display text-2xl font-semibold">Pytania o regulamin?</h2>
						<p className="mt-2 text-foreground/70">
							Napisz na{" "}
							<Link
								href="mailto:kontakt@sklep-retrohouse.pl"
								className="font-semibold text-foreground underline underline-offset-4 hover:text-terracotta"
							>
								kontakt@sklep-retrohouse.pl
							</Link>{" "}
							lub przez{" "}
							<Link
								href="/kontakt"
								className="font-semibold text-foreground underline underline-offset-4 hover:text-terracotta"
							>
								formularz kontaktowy
							</Link>
							.
						</p>
					</div>
				</Container>
			</Section>
		</main>
	);
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.replace(/[ąćęłńóśźż]/g, (char) => {
			const map: Record<string, string> = {
				ą: "a",
				ć: "c",
				ę: "e",
				ł: "l",
				ń: "n",
				ó: "o",
				ś: "s",
				ź: "z",
				ż: "z",
			};
			return map[char] ?? char;
		})
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}
