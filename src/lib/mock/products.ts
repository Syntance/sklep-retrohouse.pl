export type ProductCategory = "porcelana" | "szklo" | "dekoracje" | "meble" | "obrazy";

export type ProductEpoch = "secesja" | "art-deco" | "lata-50" | "lata-60-70" | "inne";

export type ProductBadge = "unikat" | "fresh" | "bestseller";

export type Product = {
	slug: string;
	name: string;
	priceSpread: string; // "Wiedeń, 3. dzielnica"
	price: number;
	category: ProductCategory;
	categoryLabel: string;
	epoch: ProductEpoch;
	epochLabel: string;
	manufacturer: string;
	signature?: string;
	districtVienna: string;
	dimensions: string;
	condition: string;
	badges: ProductBadge[];
	addedAt: string; // ISO date
	story: string;
	shortDescription: string;
	imageHues: [string, string, string]; // OKLCH triad placeholder
	popularity: number;
	/**
	 * Curator pick na /prezent — produkt nadaje się jako prezent
	 * z duszą (pakowanie, story, cenowy "świeet spot"). Niezależne
	 * od popularności; ustawiamy ręcznie przy wpisywaniu produktu.
	 */
	giftBestseller?: boolean;
};

const HUE_TRIADS: Record<ProductCategory, [string, string, string]> = {
	porcelana: ["oklch(0.92 0.02 80)", "oklch(0.74 0.10 80)", "oklch(0.39 0.07 45)"],
	szklo: ["oklch(0.86 0.03 75)", "oklch(0.55 0.08 50)", "oklch(0.39 0.07 45)"],
	dekoracje: ["oklch(0.78 0.06 60)", "oklch(0.55 0.08 60)", "oklch(0.27 0.005 280)"],
	meble: ["oklch(0.68 0.07 50)", "oklch(0.52 0.15 38)", "oklch(0.27 0.005 280)"],
	obrazy: ["oklch(0.84 0.04 90)", "oklch(0.60 0.06 50)", "oklch(0.27 0.005 280)"],
};

function categoryLabel(category: ProductCategory) {
	switch (category) {
		case "porcelana":
			return "Porcelana";
		case "szklo":
			return "Szkło";
		case "dekoracje":
			return "Dekoracje";
		case "meble":
			return "Meble";
		case "obrazy":
			return "Obrazy";
	}
}

function epochLabel(epoch: ProductEpoch) {
	switch (epoch) {
		case "secesja":
			return "Secesja";
		case "art-deco":
			return "Art Deco";
		case "lata-50":
			return "Lata 50.";
		case "lata-60-70":
			return "Lata 60.–70.";
		case "inne":
			return "Inne";
	}
}

const RAW_PRODUCTS: Array<
	Omit<Product, "categoryLabel" | "epochLabel" | "imageHues" | "priceSpread">
> = [
	{
		slug: "filizanka-augarten-secesja-1910",
		name: "Filiżanka Augarten — Wiedeń, ok. 1910",
		price: 280,
		category: "porcelana",
		epoch: "secesja",
		manufacturer: "Augarten",
		signature: "Niebieska tarcza Augarten",
		districtVienna: "3. dzielnica (Landstraße)",
		dimensions: "wys. 6 cm · ø 8 cm",
		condition: "Stan idealny, złocenia oryginalne, drobna patyna na uchu.",
		badges: ["unikat", "fresh"],
		addedAt: "2026-04-22",
		story:
			"Odkupiona od właściciela mieszkania w 3. dzielnicy Wiednia. Filiżanka stała w witrynie obok serwisu od 1910 roku — została w rodzinie do 2025.",
		shortDescription:
			"Porcelana Augarten z secesyjnym dekorem. 100% wiedeńskie pochodzenie, sygnatura niebieskiej tarczy.",
		popularity: 87,
		giftBestseller: true,
	},
	{
		slug: "wazon-rosenthal-art-deco-1934",
		name: "Wazon Rosenthal Ivory — Art Deco, 1934",
		price: 720,
		category: "porcelana",
		epoch: "art-deco",
		manufacturer: "Rosenthal",
		signature: "Rosenthal Selb · Ivory",
		districtVienna: "1. dzielnica (Innere Stadt)",
		dimensions: "wys. 24 cm · ø 12 cm",
		condition: "Drobne ślady użytkowania na podstawie — potwierdzają autentyczność. Bez pęknięć.",
		badges: ["unikat", "bestseller"],
		addedAt: "2026-04-12",
		story:
			"Z apartamentu przy Ringstraße. Właściciel — kolekcjoner ceramiki — sprzedał całą kolekcję przed przeprowadzką do domu seniora.",
		shortDescription:
			"Wazon Rosenthal w serii Ivory, Art Deco lata 30. Pochodzenie udokumentowane w rachunku zakupu.",
		popularity: 95,
	},
	{
		slug: "karafka-szklo-rzezbione-1940",
		name: "Karafka kryształowa, ręcznie cięta · 1940",
		price: 340,
		category: "szklo",
		epoch: "lata-50",
		manufacturer: "Lobmeyr (atrybucja)",
		districtVienna: "9. dzielnica (Alsergrund)",
		dimensions: "wys. 26 cm · poj. 0,8 l",
		condition: "Bez ubytków, drobne mikrorysy w spodzie (norma).",
		badges: ["unikat"],
		addedAt: "2026-03-29",
		story:
			"Kupiona od pary z 9. dzielnicy. Karafka stała na bufecie podczas niedzielnych obiadów przez 80 lat.",
		shortDescription:
			"Karafka z grubego kryształu, ręcznie cięte motywy diamentowe. Zachowuje wagę i klasę okresu międzywojennego.",
		popularity: 70,
		giftBestseller: true,
	},
	{
		slug: "lampka-stolowa-mosiezna-1962",
		name: "Lampka stołowa, mosiądz i opal · 1962",
		price: 890,
		category: "meble",
		epoch: "lata-60-70",
		manufacturer: "Kalmar Wien",
		districtVienna: "7. dzielnica (Neubau)",
		dimensions: "wys. 38 cm · ø klosza 18 cm",
		condition: "Po pełnej elektrokonserwacji — nowy kabel, oryginalna oprawka.",
		badges: ["unikat", "fresh"],
		addedAt: "2026-04-25",
		story:
			"Z mieszkania architekta z Neubau — projektowała tam swoje portfolio od lat 60. Lampka pracowała na biurku do dnia odsprzedaży.",
		shortDescription:
			"Lampka Kalmar Wien — chłodny mosiądz, ciepłe opalowe światło. Ikoniczny design wiedeński.",
		popularity: 90,
		giftBestseller: true,
	},
	{
		slug: "figurka-porcelanowa-balerina-1955",
		name: "Figurka porcelanowa „Balerina” · 1955",
		price: 220,
		category: "dekoracje",
		epoch: "lata-50",
		manufacturer: "Wiener Manufaktur",
		districtVienna: "4. dzielnica (Wieden)",
		dimensions: "wys. 18 cm",
		condition: "Bez ubytków, oryginalna polichromia.",
		badges: ["fresh"],
		addedAt: "2026-04-20",
		story:
			"Kolekcja figurek pochodzi z mieszkania śpiewaczki Wiener Volksoper. Każda figurka miała własną nazwę — ta to „Lotte”.",
		shortDescription:
			"Drobna figurka z atelier wiedeńskiego — typowy element dekoracyjny powojennego salonu.",
		popularity: 65,
		giftBestseller: true,
	},
	{
		slug: "obraz-akwarela-graben-1928",
		name: "Akwarela „Graben” · 1928, sygnowana",
		price: 1480,
		category: "obrazy",
		epoch: "art-deco",
		manufacturer: "F. Kessler",
		signature: "F. Kessler '28",
		districtVienna: "1. dzielnica (Innere Stadt)",
		dimensions: "30 × 42 cm (z ramą)",
		condition: "Oryginalna rama, drobne otarcia złoceń. Akwarela bez przebarwień.",
		badges: ["unikat"],
		addedAt: "2026-03-15",
		story:
			"Akwarela wisiała w gabinecie adwokata przy Graben. Spadkobiercy zdecydowali o sprzedaży kolekcji.",
		shortDescription: "Sygnowana akwarela wiedeńska — fragment Graben w godzinie błękitnej.",
		popularity: 78,
	},
	{
		slug: "zegar-kominkowy-secesja-1908",
		name: "Zegar kominkowy, secesja · 1908",
		price: 1980,
		category: "dekoracje",
		epoch: "secesja",
		manufacturer: "Lenzkirch",
		districtVienna: "8. dzielnica (Josefstadt)",
		dimensions: "wys. 42 cm · szer. 32 cm",
		condition: "Mechanizm po przeglądzie zegarmistrza, gra dwa razy na godzinę.",
		badges: ["unikat", "bestseller"],
		addedAt: "2026-04-02",
		story:
			"Z mieszkania profesora literatury z Josefstadt. Zegar bił przez ponad 110 lat — i nadal bije.",
		shortDescription:
			"Secesyjny zegar kominkowy z mechanizmem Lenzkirch. Premium element gabinetu.",
		popularity: 92,
	},
	{
		slug: "krzeslo-thonet-kawiarniane-1925",
		name: "Krzesło Thonet kawiarniane · 1925",
		price: 540,
		category: "meble",
		epoch: "art-deco",
		manufacturer: "Thonet",
		signature: "Thonet · pieczęć na ramie",
		districtVienna: "6. dzielnica (Mariahilf)",
		dimensions: "wys. 92 cm · siedzisko 45 cm",
		condition: "Po renowacji ramy, plecionka oryginalna, drobne ślady używania.",
		badges: ["fresh"],
		addedAt: "2026-04-26",
		story:
			"Krzesło z wiedeńskiej kawiarni przy Mariahilf, która zamknęła się w 2024 roku po 99 latach. Uratowane przed wystawieniem na śmietnik.",
		shortDescription:
			"Klasyczne Thonet z plecionką wiedeńską — siadało na nim pokolenie pisarzy z Mariahilf.",
		popularity: 80,
	},
	{
		slug: "ramka-portretowa-secesja-1905",
		name: "Ramka portretowa, secesja · 1905",
		price: 95,
		category: "dekoracje",
		epoch: "secesja",
		manufacturer: "Atelier Wien",
		districtVienna: "2. dzielnica (Leopoldstadt)",
		dimensions: "12 × 17 cm",
		condition: "Drobne otarcia złoceń, mosiądz w pełnej formie.",
		badges: ["fresh"],
		addedAt: "2026-04-27",
		story: "Z mieszkania na Praterstraße — ramka stała na komodzie z portretem prababki.",
		shortDescription:
			"Drobny prezent z duszą — secesyjna ramka mosiężna, idealna pod portret rodzinny.",
		popularity: 55,
		giftBestseller: true,
	},
	{
		slug: "serwis-kawowy-augarten-art-deco",
		name: "Serwis kawowy Augarten · Art Deco (6 osób)",
		price: 2400,
		category: "porcelana",
		epoch: "art-deco",
		manufacturer: "Augarten",
		signature: "Augarten · niebieska tarcza",
		districtVienna: "1. dzielnica (Innere Stadt)",
		dimensions: "21 elementów",
		condition: "Komplet, bez wyszczerbień. Drobna patyna na spodkach.",
		badges: ["unikat", "bestseller"],
		addedAt: "2026-03-08",
		story:
			"Serwis ślubny z 1934, używany przy świątecznych okazjach. Sprzedany przez wnuczkę po przeprowadzce z Innere Stadt.",
		shortDescription:
			"Pełny komplet Augarten Art Deco — niedostępny na rynku wtórnym przez ostatnie 6 miesięcy.",
		popularity: 98,
	},
	{
		slug: "szklane-kieliszki-zielone-1955",
		name: "Komplet 6 kieliszków zielonych · 1955",
		price: 180,
		category: "szklo",
		epoch: "lata-50",
		manufacturer: "Bohemia Glass",
		districtVienna: "10. dzielnica (Favoriten)",
		dimensions: "wys. 14 cm · poj. 80 ml",
		condition: "Komplet 6 sztuk, jeden z drobnym mikrorysem (norma).",
		badges: ["fresh"],
		addedAt: "2026-04-19",
		story:
			"Z bufetu wiedeńskiej rodziny. Kieliszki używane wyłącznie na święta, dlatego ich stan jest tak dobry.",
		shortDescription: "Komplet 6 sztuk — głęboka butelkowa zieleń, idealny pod czarne wnętrza.",
		popularity: 60,
		giftBestseller: true,
	},
	{
		slug: "obraz-olej-palac-schonbrunn",
		name: "Olej „Schönbrunn o świcie” · 1962",
		price: 2200,
		category: "obrazy",
		epoch: "lata-60-70",
		manufacturer: "M. Hauser",
		signature: "M. Hauser · 1962",
		districtVienna: "13. dzielnica (Hietzing)",
		dimensions: "60 × 80 cm (z ramą)",
		condition: "Bez retuszy, oryginalna rama, lekko zakurzony werniks.",
		badges: ["unikat"],
		addedAt: "2026-02-28",
		story:
			"Wisiał w salonie willi w Hietzing — 100 metrów od bramy parku Schönbrunn. Sprzedany przez córkę po przeprowadzce do Włoch.",
		shortDescription: "Sygnowany olej z 1962 — fragment Schönbrunn w pastelowym świetle.",
		popularity: 73,
	},
];

export const PRODUCTS: Product[] = RAW_PRODUCTS.map((product) => ({
	...product,
	categoryLabel: categoryLabel(product.category),
	epochLabel: epochLabel(product.epoch),
	priceSpread: product.districtVienna,
	imageHues: HUE_TRIADS[product.category],
}));

export function getProductBySlug(slug: string): Product | undefined {
	return PRODUCTS.find((product) => product.slug === slug);
}

export function getRelatedProducts(slug: string, limit = 4): Product[] {
	const current = getProductBySlug(slug);
	if (!current) return PRODUCTS.slice(0, limit);
	return PRODUCTS.filter(
		(product) =>
			product.slug !== slug &&
			(product.category === current.category || product.epoch === current.epoch),
	).slice(0, limit);
}

export const PRODUCT_CATEGORIES: Array<{
	value: ProductCategory;
	label: string;
}> = [
	{ value: "porcelana", label: "Porcelana" },
	{ value: "szklo", label: "Szkło" },
	{ value: "dekoracje", label: "Dekoracje" },
	{ value: "meble", label: "Meble" },
	{ value: "obrazy", label: "Obrazy" },
];

export const PRODUCT_EPOCHS: Array<{ value: ProductEpoch; label: string }> = [
	{ value: "secesja", label: "Secesja" },
	{ value: "art-deco", label: "Art Deco" },
	{ value: "lata-50", label: "Lata 50." },
	{ value: "lata-60-70", label: "Lata 60.–70." },
	{ value: "inne", label: "Inne" },
];

export const PRICE_BUCKETS: Array<{
	id: string;
	label: string;
	min: number;
	max?: number;
}> = [
	{ id: "do-100", label: "do 100 zł", min: 0, max: 100 },
	{ id: "100-300", label: "100–300 zł", min: 100, max: 300 },
	{ id: "300-500", label: "300–500 zł", min: 300, max: 500 },
	{ id: "500-plus", label: "500+ zł", min: 500 },
];
