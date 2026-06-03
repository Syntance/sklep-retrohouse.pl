import type { Metadata } from "next";
import Link from "next/link";
import { STORE_INFO } from "@/components/layout/site-header/nav-data";
import { Breadcrumbs, Container, Eyebrow, Section } from "@/components/primitives";
import { LEGAL_DOCUMENT_CONTACT } from "@/components/sections/legal-document-contact/presets";
import { LegalDocumentContactSection } from "@/components/sections/legal-document-contact/section";
import { EMAIL_CONTACT } from "@/lib/email/constants";
import { ReklamacjePortal } from "./reklamacje-portal";

const DOCUMENT_VERSION = "2026-06-03";

const SELLER_ADDRESS = `${STORE_INFO.name}\n${STORE_INFO.streetAddress}\n${STORE_INFO.postalCode} ${STORE_INFO.city}`;

export const metadata: Metadata = {
	title: "Reklamacje — zgodność towaru z umową",
	description:
		"Procedura reklamacyjna RetroHouse: zgodność towaru z umową (UPK), antyki, terminy 14 dni, wzór formularza. Uszkodzenia w transporcie — zgłoszenie ze zdjęciami.",
	robots: { index: true, follow: true },
	alternates: { canonical: "/reklamacje" },
};

type SectionBlock = {
	number: number;
	title: string;
	paragraphs?: string[];
	list?: string[];
	orderedList?: string[];
};

const SECTIONS: SectionBlock[] = [
	{
		number: 1,
		title: "Kogo dotyczą poszczególne reżimy",
		list: [
			"Konsument oraz Przedsiębiorca na prawach Konsumenta (POPK) — odpowiedzialność Sprzedawcy za brak zgodności Towaru z umową (rozdz. 5a UPK, art. 43a–43g).",
			"Przedsiębiorca (zakup w celach zawodowych) — rękojmia z KC, która zgodnie z art. 558 §1 KC zostaje wyłączona.",
		],
	},
	{
		number: 2,
		title: "Podstawa prawna",
		list: [
			"Ustawa o prawach konsumenta (rozdz. 5a — po nowelizacji z 1.01.2023)",
			"Kodeks cywilny (art. 556 i nast.)",
			"Dyrektywa towarowa (UE) 2019/771",
		],
	},
	{
		number: 3,
		title: "Okres odpowiedzialności",
		paragraphs: [
			"Sprzedawca odpowiada za brak zgodności Towaru z umową istniejący w chwili dostarczenia i ujawniony w ciągu 2 lat od wydania Towaru.",
			"Brak zgodności ujawniony w tym okresie objęty jest domniemaniem, że istniał w chwili dostarczenia — ciężar dowodu spoczywa na Sprzedawcy.",
		],
	},
	{
		number: 4,
		title: "Specyfika antyków — co podlega, a co nie podlega reklamacji",
		paragraphs: [
			"Antyki są rzeczami używanymi. Opis stanu na karcie produktu jest częścią umowy sprzedaży. Cechy (ślady użytkowania, uszkodzenia, naprawy) wyraźnie wskazane w opisie i zaakceptowane przez Ciebie w koszyku (art. 43a ust. 4 UPK) nie stanowią braku zgodności z umową i nie mogą być podstawą reklamacji.",
		],
		list: [
			"Reklamacji nie podlegają: cechy i ślady użytkowania wyraźnie opisane na karcie produktu i odrębnie zaakceptowane przed zakupem.",
			"Reklamacji podlegają: wady ukryte niewskazane w opisie stanu, istniejące w chwili wydania; uszkodzenia powstałe w transporcie (zgłoś ze zdjęciami paczki i przedmiotu w ciągu 24 h od dostawy); niezgodność z opisem (np. inne wymiary, brak elementu opisanego jako obecny); brak cech, które nie zostały wyraźnie zaakceptowane.",
		],
	},
	{
		number: 5,
		title: "Uprawnienia Klienta (Konsument / POPK)",
		orderedList: [
			"W pierwszej kolejności możesz żądać naprawy lub wymiany. Z uwagi na unikatowy charakter Towarów wymiana jest niemożliwa, a naprawa możliwa wyłącznie, jeżeli nie naruszy wartości kolekcjonerskiej antyku.",
			"Jeżeli naprawa jest niemożliwa lub nadmiernie utrudniona, możesz złożyć oświadczenie o obniżeniu ceny albo o odstąpieniu od umowy (gdy brak zgodności jest istotny).",
			"Nie możesz odstąpić od umowy, jeżeli brak zgodności jest nieistotny (domniemywa się, że jest istotny).",
		],
	},
	{
		number: 6,
		title: "Jak złożyć reklamację",
		paragraphs: [
			"Zgłoszenie powinno zawierać: dane Klienta i kontakt, numer zamówienia, opis niezgodności i okoliczności jej stwierdzenia, żądanie (naprawa / obniżenie ceny / odstąpienie) oraz — jeśli to możliwe — dokumentację fotograficzną.",
		],
	},
	{
		number: 7,
		title: "Termin rozpatrzenia",
		paragraphs: [
			"Sprzedawca ustosunkuje się do reklamacji w terminie 14 dni od jej otrzymania.",
			"Brak odpowiedzi w terminie 14 dni oznacza uznanie reklamacji (dotyczy Konsumenta i POPK).",
		],
	},
	{
		number: 8,
		title: "Koszty",
		paragraphs: [
			"Koszt dostarczenia reklamowanego Towaru do Sprzedawcy w ramach uzasadnionej reklamacji ponosi Sprzedawca.",
			"W razie uznania reklamacji Sprzedawca zwraca Ci poniesione, niezbędne koszty.",
		],
	},
	{
		number: 9,
		title: "Zwrot środków przy uznanej reklamacji",
		paragraphs: [
			"Obniżenie ceny lub zwrot następuje niezwłocznie, nie później niż 14 dni od uznania reklamacji, tą samą metodą płatności, chyba że wyrazisz zgodę na inną.",
		],
	},
	{ number: 10, title: "Pozasądowe rozwiązywanie sporów" },
];

export default function ReklamacjePage() {
	const mailtoClaims = `mailto:${EMAIL_CONTACT}?subject=${encodeURIComponent("Reklamacja — RetroHouse")}`;

	return (
		<main id="main" className="flex flex-col">
			<Section spacing="sm">
				<Container size="md">
					<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Reklamacje" }]} />
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<Eyebrow>Zgodność z umową · UPK rozdz. 5a</Eyebrow>
					<h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.05]">
						Reklamacje
					</h1>
					<p className="mt-4 max-w-2xl text-foreground/70">
						Zgodność Towaru z umową — procedura dla Konsumentów i przedsiębiorców na prawach
						konsumenta. Wersja z dnia{" "}
						<time dateTime={DOCUMENT_VERSION}>
							{new Date(`${DOCUMENT_VERSION}T12:00:00`).toLocaleDateString("pl-PL")}
						</time>
						.
					</p>

					<aside className="mt-6 rounded-2xl border border-brass/40 bg-terracotta/15 p-5 text-sm leading-relaxed">
						<p className="font-display text-base font-semibold">Antyki — opis stanu w umowie</p>
						<p className="mt-1 text-foreground/80">
							Ślady użytkowania, uszkodzenia i naprawy <strong className="text-foreground">wyraźnie opisane na karcie produktu</strong>{" "}
							i zaakceptowane w koszyku nie są brakiem zgodności z umową (art. 43a ust. 4 UPK).
						</p>
					</aside>
				</Container>
			</Section>

			<Section spacing="md">
				<Container size="md">
					<div className="space-y-10">
						{SECTIONS.map((section) => (
							<section key={section.number} id={slugify(section.title)}>
								<LegalSectionHeading number={section.number} title={section.title} />
								{section.paragraphs?.map((paragraph) => (
									<p key={paragraph} className="mt-2 text-foreground/80 leading-relaxed">
										{paragraph}
									</p>
								))}
								{section.list ? <LegalBulletList items={section.list} /> : null}
								{section.orderedList ? (
									<LegalNumberedList items={section.orderedList} />
								) : null}
								{section.number === 6 ? (
									<ul className="mt-4 space-y-3 text-foreground/80 leading-relaxed">
										<li>
											<strong className="text-foreground">E-mail:</strong>{" "}
											<Link
												href={mailtoClaims}
												className="font-semibold underline underline-offset-4 hover:text-terracotta"
											>
												{EMAIL_CONTACT}
											</Link>
										</li>
										<li>
											<strong className="text-foreground">Pisemnie / odsyłka Towaru:</strong>
											<br />
											<span className="whitespace-pre-line">{SELLER_ADDRESS}</span>
										</li>
										<li>
											<strong className="text-foreground">Formularz online:</strong>{" "}
											<a
												href="#formularz-reklamacyjny"
												className="font-semibold underline underline-offset-4 hover:text-terracotta"
											>
												zaloguj się i złóż reklamację poniżej
											</a>{" "}
											— powiązane z Twoim zamówieniem, trafia do magazynu.
										</li>
									</ul>
								) : null}
								{section.number === 10 ? (
									<ul className="mt-3 space-y-2 text-foreground/80 leading-relaxed">
										<li>
											<Link
												href="https://ec.europa.eu/consumers/odr"
												className="font-semibold underline underline-offset-4 hover:text-terracotta"
												rel="noopener noreferrer"
												target="_blank"
											>
												Platforma ODR UE
											</Link>
										</li>
										<li>Powiatowy (miejski) rzecznik konsumentów</li>
										<li>Wojewódzki Inspektorat Inspekcji Handlowej</li>
										<li>
											<Link
												href="https://uokik.gov.pl/"
												className="font-semibold underline underline-offset-4 hover:text-terracotta"
												rel="noopener noreferrer"
												target="_blank"
											>
												UOKiK
											</Link>
										</li>
									</ul>
								) : null}
							</section>
						))}
					</div>
				</Container>
			</Section>

			<Section spacing="md" tone="muted">
				<Container size="md">
					<div id="formularz-reklamacyjny" className="scroll-mt-24">
						<h2 className="font-display text-2xl font-semibold">Złóż reklamację online</h2>
						<p className="mt-2 max-w-xl text-foreground/70">
							Ten sam sposób logowania co przy odstąpieniu od umowy — kod na e-mail, potem
							wybór produktu z zamówienia.
						</p>
						<div className="mt-6">
							<ReklamacjePortal />
						</div>
					</div>
					<p className="mt-6 text-sm text-foreground/70">
						Wolisz wysłać listownie? Adres:{" "}
						<span className="whitespace-pre-line">{SELLER_ADDRESS}</span>
						{" · "}
						<Link
							href={`mailto:${EMAIL_CONTACT}`}
							className="font-semibold underline underline-offset-4 hover:text-terracotta"
						>
							{EMAIL_CONTACT}
						</Link>
					</p>
				</Container>
			</Section>

			<LegalDocumentContactSection {...LEGAL_DOCUMENT_CONTACT.claims} />
		</main>
	);
}

function LegalSectionHeading({ number, title }: { number: number; title: string }) {
	return (
		<h2 className="flex items-baseline gap-2.5 font-display text-2xl font-semibold leading-tight">
			<span className="shrink-0 tabular-nums">{number}.</span>
			<span className="min-w-0 text-balance">{title}</span>
		</h2>
	);
}

function LegalNumberedList({ items }: { items: string[] }) {
	return (
		<ol className="mt-3 list-none space-y-2">
			{items.map((item, index) => (
				<li key={item} className="flex gap-3 text-foreground/80 leading-relaxed">
					<span className="w-5 shrink-0 text-right tabular-nums text-foreground/70">
						{index + 1}.
					</span>
					<span className="min-w-0 flex-1">{item}</span>
				</li>
			))}
		</ol>
	);
}

function LegalBulletList({ items }: { items: string[] }) {
	return (
		<ul className="mt-3 list-none space-y-2">
			{items.map((item) => (
				<li key={item} className="flex gap-3 text-foreground/80 leading-relaxed">
					<span
						className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-foreground/45"
						aria-hidden
					/>
					<span className="min-w-0 flex-1">{item}</span>
				</li>
			))}
		</ul>
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
