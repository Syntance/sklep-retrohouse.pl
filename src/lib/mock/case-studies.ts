export type CaseStudy = {
	slug: string;
	title: string;
	studio: string;
	city: string;
	summary: string;
	hue: string;
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
	},
	{
		slug: "loft-praga-poludnie-warszawa",
		title: "Loft 120 m² na Pradze — vintage z industrialnym tłem",
		studio: "Pracownia Wątek",
		city: "Warszawa",
		summary:
			"Krzesła Thonet i lustro mosiężne ujednoliciły surowy industrial — bez utraty charakteru.",
		hue: "oklch(0.52 0.15 38)",
	},
	{
		slug: "willa-zakopane-modernizm-wiedenski",
		title: "Willa w Zakopanem — Wiedeń spotkał Podhale",
		studio: "Atelier Polana",
		city: "Zakopane",
		summary:
			"Serwis Augarten i obraz Schönbrunn na tle drewnianego stropu — kontrast, który działa.",
		hue: "oklch(0.39 0.07 45)",
	},
	{
		slug: "biuro-kreatywne-poznan",
		title: "Biuro kreatywne 250 m² — antyki w open space",
		studio: "Studio Kafle",
		city: "Poznań",
		summary:
			"Zegar Lenzkirch w sali konferencyjnej i komplet kieliszków na barku — kultura firmy w detalu.",
		hue: "oklch(0.78 0.06 60)",
	},
];
