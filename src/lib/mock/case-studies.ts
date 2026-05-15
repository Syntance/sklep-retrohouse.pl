export type CaseStudy = {
	slug: string;
	title: string;
	studio: string;
	city: string;
	summary: string;
	hue: string;
	/** Slug artykułu na blogu, do którego prowadzi karta (lead nurturing). */
	articleSlug: string;
};

export const CASE_STUDIES: CaseStudy[] = [
	{
		slug: "marta-zaleska-apartament-krakow",
		title: "Apartament 80 m² · 3 antyki · 1 historia",
		studio: "Studio Zaleska",
		city: "Kraków",
		summary:
			"Wazon Rosenthal, akwarela Kessler i lampka Kalmar — trzy przedmioty zdefiniowały atmosferę całego salonu.",
		hue: "oklch(0.74 0.10 80)",
		articleSlug: "marta-z-krakowa-3-antyki-w-apartamencie-80m",
	},
	{
		slug: "loft-praga-poludnie-warszawa",
		title: "Loft 120 m² na Pradze — vintage z industrialnym tłem",
		studio: "Pracownia Wątek",
		city: "Warszawa",
		summary:
			"Krzesła Thonet i lustro mosiężne ujednoliciły surowy industrial — bez utraty charakteru.",
		hue: "oklch(0.52 0.15 38)",
		articleSlug: "5-przedmiotow-ktore-odmienia-twoj-salon",
	},
	{
		slug: "willa-zakopane-modernizm-wiedenski",
		title: "Willa w Zakopanem — Wiedeń spotkał Podhale",
		studio: "Atelier Polana",
		city: "Zakopane",
		summary:
			"Serwis Augarten i obraz Schönbrunn na tle drewnianego stropu — kontrast, który działa.",
		hue: "oklch(0.39 0.07 45)",
		articleSlug: "secesja-wiedenska-przewodnik-dla-poczatkujacych",
	},
	{
		slug: "biuro-kreatywne-poznan",
		title: "Biuro kreatywne 250 m² — antyki w open space",
		studio: "Studio Kafle",
		city: "Poznań",
		summary:
			"Zegar Lenzkirch w sali konferencyjnej i komplet kieliszków na barku — kultura firmy w detalu.",
		hue: "oklch(0.78 0.06 60)",
		articleSlug: "dla-projektantow-jak-pracujemy-z-briefem",
	},
];

/** Cytaty projektantów do sekcji "Zaufanie". 2 opinie + zdjęcia placeholder. */
export const B2B_TESTIMONIALS = [
	{
		id: "marta-zaleska",
		body: "Pierwszy raz w karierze klient zaufał selekcji 100% — wystarczyło pokazać kartę historii każdego przedmiotu. RetroHouse robi pracę, którą sami robilibyśmy 10 razy dłużej.",
		author: "Marta Zaleska",
		role: "Studio Zaleska, Kraków",
	},
	{
		id: "tomek-watkowski",
		body: "Rezerwacja 14 dni i FV VAT to dla studia game-changer. Plus newsletter B2B 48h przed sklepem — robimy briefy klientom z przewagą na rynku.",
		author: "Tomek Wątkowski",
		role: "Pracownia Wątek, Warszawa",
	},
] as const;

/** Statystyki "twardo" — z planu strategii (zaufanie B2B). */
export const B2B_STATS = [
	{ value: "12 h", label: "Średni czas odpowiedzi" },
	{ value: "14 dni", label: "Rezerwacja na prezentację" },
	{ value: "48 h", label: "Newsletter B2B przed sklepem" },
	{ value: "100%", label: "Pochodzenie z Wiednia" },
] as const;

/** Logo studios — placeholder lista (w PR future Sanity). */
export const B2B_STUDIO_LOGOS = [
	"Studio Zaleska",
	"Pracownia Wątek",
	"Atelier Polana",
	"Studio Kafle",
	"Loft Architects",
	"Krakowska Pracownia",
] as const;
