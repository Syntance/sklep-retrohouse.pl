export type PostCategory =
	| "wiedenskie-historie"
	| "edukacja"
	| "inspiracje"
	| "poradniki"
	| "realizacje";

export type Post = {
	slug: string;
	title: string;
	excerpt: string;
	category: PostCategory;
	categoryLabel: string;
	publishedAt: string;
	readingTime: number;
	author: string;
	featured?: boolean;
	heroHue: string;
};

const CATEGORY_LABELS: Record<PostCategory, string> = {
	"wiedenskie-historie": "Wiedeńskie historie",
	edukacja: "Jak rozpoznać antyk",
	inspiracje: "Inspiracje wnętrzarskie",
	poradniki: "Poradniki",
	realizacje: "Realizacje",
};

export const POSTS: Post[] = [
	{
		slug: "dlaczego-antyki-podnosza-postrzeganie-wnetrza",
		title: "Dlaczego antyki podnoszą postrzeganie wnętrza",
		excerpt:
			"Trzy mechanizmy, dzięki którym jeden przedmiot z duszą zmienia odbiór całego pokoju — bez remontu i bez kompromisu wobec stylu.",
		category: "edukacja",
		categoryLabel: CATEGORY_LABELS.edukacja,
		publishedAt: "2026-04-22",
		readingTime: 6,
		author: "Redakcja RetroHouse",
		featured: true,
		heroHue: "oklch(0.74 0.10 80)",
	},
	{
		slug: "jak-rozpoznac-prawdziwa-porcelane-rosenthal",
		title: "Jak rozpoznać prawdziwą porcelanę Rosenthal",
		excerpt:
			"Sygnatura, krawędź, dźwięk — krótki przewodnik po rozpoznawaniu autentyków marki ze 140-letnią historią.",
		category: "edukacja",
		categoryLabel: CATEGORY_LABELS.edukacja,
		publishedAt: "2026-04-15",
		readingTime: 5,
		author: "Redakcja RetroHouse",
		heroHue: "oklch(0.91 0.014 70)",
	},
	{
		slug: "5-przedmiotow-ktore-odmienia-twoj-salon",
		title: "5 przedmiotów, które odmienią Twój salon",
		excerpt:
			"Konkretne propozycje z naszego sklepu — od secesyjnej ramki za 95 zł po wazon Augarten za 2400 zł.",
		category: "inspiracje",
		categoryLabel: CATEGORY_LABELS.inspiracje,
		publishedAt: "2026-04-08",
		readingTime: 4,
		author: "Redakcja RetroHouse",
		heroHue: "oklch(0.78 0.06 60)",
	},
	{
		slug: "backstage-jak-dobieramy-antyki-w-wiedniu",
		title: "Backstage: tak dobieramy antyki w Wiedniu",
		excerpt:
			"Dwa dni, sześć mieszkań i czterdzieści przedmiotów — relacja z naszej ostatniej wyprawy do Wiednia.",
		category: "wiedenskie-historie",
		categoryLabel: CATEGORY_LABELS["wiedenskie-historie"],
		publishedAt: "2026-04-01",
		readingTime: 8,
		author: "Redakcja RetroHouse",
		heroHue: "oklch(0.62 0.07 220)",
	},
	{
		slug: "secesja-wiedenska-przewodnik-dla-poczatkujacych",
		title: "Secesja wiedeńska — przewodnik dla początkujących",
		excerpt:
			"Jugendstil, Wiener Werkstätte, Klimt i Hoffmann. Co odróżnia secesję wiedeńską od europejskiej?",
		category: "edukacja",
		categoryLabel: CATEGORY_LABELS.edukacja,
		publishedAt: "2026-03-20",
		readingTime: 9,
		author: "Redakcja RetroHouse",
		heroHue: "oklch(0.55 0.08 60)",
	},
	{
		slug: "marta-z-krakowa-3-antyki-w-apartamencie-80m",
		title: "Jak Marta z Krakowa wykorzystała 3 antyki w apartamencie 80 m²",
		excerpt:
			"Studium przypadku z architekt wnętrz: jak trzy przedmioty z Wiednia zdefiniowały całą aranżację.",
		category: "realizacje",
		categoryLabel: CATEGORY_LABELS.realizacje,
		publishedAt: "2026-03-12",
		readingTime: 7,
		author: "Redakcja RetroHouse",
		heroHue: "oklch(0.43 0.07 150)",
	},
	{
		slug: "dla-projektantow-jak-pracujemy-z-briefem",
		title: "Dla projektantów: jak pracujemy z briefem i mood boardem",
		excerpt: "Krok po kroku przez nasz proces B2B — od mood boardu do FV i rezerwacji 14 dni.",
		category: "realizacje",
		categoryLabel: CATEGORY_LABELS.realizacje,
		publishedAt: "2026-03-04",
		readingTime: 6,
		author: "Redakcja RetroHouse",
		heroHue: "oklch(0.39 0.06 245)",
	},
	{
		slug: "jak-dbac-o-porcelane",
		title: "Jak dbać o porcelanę — 6 zasad ze sklepu",
		excerpt:
			"Mycie, przechowywanie, klejenie pęknięć — odpowiadamy na najczęstsze pytania klientów.",
		category: "poradniki",
		categoryLabel: CATEGORY_LABELS.poradniki,
		publishedAt: "2026-02-21",
		readingTime: 4,
		author: "Redakcja RetroHouse",
		heroHue: "oklch(0.86 0.04 200)",
	},
];

export const POST_CATEGORIES: Array<{ value: PostCategory; label: string }> = (
	Object.entries(CATEGORY_LABELS) as Array<[PostCategory, string]>
).map(([value, label]) => ({ value, label }));

export function getPostBySlug(slug: string): Post | undefined {
	return POSTS.find((post) => post.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3): Post[] {
	const current = getPostBySlug(slug);
	if (!current) return POSTS.slice(0, limit);
	return POSTS.filter((post) => post.slug !== slug && post.category === current.category).slice(
		0,
		limit,
	);
}
