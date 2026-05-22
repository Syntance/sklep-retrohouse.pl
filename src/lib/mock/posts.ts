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
	/** Slug produktu polecanego mid-article (mid-CTA do PDP). */
	relatedProductSlug?: string;
	/** Rozbudowana treść artykułu (sekcje markdown-like) — opcjonalna. */
	bodyExtended?: ArticleBody;
};

export type ArticleSection = {
	heading: string;
	paragraphs: string[];
};

export type ArticleBody = {
	intro: string;
	sections: ArticleSection[];
	conclusion: string;
	cta: {
		eyebrow: string;
		title: string;
		description: string;
		buttonLabel: string;
	};
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
		relatedProductSlug: "wazon-rosenthal-art-deco-1934",
		bodyExtended: {
			intro:
				"Wnętrze, w którym wszystko jest nowe, brzmi jak playlist bez ulubionej piosenki — technicznie poprawnie, emocjonalnie pusto. Antyk z duszą działa odwrotnie: jeden przedmiot z historią zmienia rytm całej przestrzeni, bo oko natychmiast szuka opowieści. Klientki, które zaczęły od jednej filiżanki Augarten, wracają po wazon, bo poranna kawa w domu zaczyna wyglądać jak ta z wiedeńskiej kawiarni. Poniżej trzy mechanizmy, które wyjaśniają to zjawisko, oraz konkretne przedmioty z naszego sklepu, na których możesz to przetestować.",
			sections: [
				{
					heading: "1. Patyna jako sygnał statusu",
					paragraphs: [
						"W psychologii konsumpcji funkcjonuje pojęcie „costly signaling” — drogie sygnały, które otoczenie odczytuje jako dowód gustu i czasu. Patyna na mosiądzu, mikrorysy w glazurze porcelany, mleczne smugi na szkle mówią widzowi jedno: ten przedmiot przeszedł przez czyjeś życie i przetrwał. Wnętrze z jednym takim obiektem czyta się inaczej niż salon wypełniony produkcją seryjną — kontrast między starym a nowym podnosi prestiż całej przestrzeni.",
						"Ważne: to nie działa, gdy antyków jest dużo. Magia tkwi w kontraście. Jeden przedmiot z secesji wiedeńskiej w skandynawskim minimalu = high-impact. Pokój pełen antyków = muzeum, które męczy oko. W naszym briefie B2B dla architektów zawsze proponujemy regułę 1:5 — jeden antyk na każde pięć współczesnych elementów wnętrza.",
					],
				},
				{
					heading: "2. Storytelling automatyzuje rozmowy z gośćmi",
					paragraphs: [
						"Każdy nasz przedmiot ma kartę historii — kiedy go odkupiliśmy, jaką drogą trafił do Nowego Targu. To nie jest copywriting na siłę, to surowa dokumentacja. Klienci mówią nam, że karta historii zostaje przy przedmiocie i staje się dyżurną opowieścią dla gości: „Ten wazon? Augarten, 1934, odkupiony bezpośrednio od wnuczki kolekcjonera”.",
						"Z perspektywy biznesowej to klasyczny endowment effect — przedmiot z opowieścią staje się trudniejszy do oddania, bo emocjonalnie kosztuje więcej. Z perspektywy użytkownika: w kilka sekund masz gotową anegdotę, która podkreśla Twój gust bez przechwałek.",
					],
				},
				{
					heading: "3. Kontrast estetyczny rozbija nudę",
					paragraphs: [
						"Trzeci mechanizm jest najbardziej praktyczny. W mieszkaniach po remoncie z 2020+ dominują materiały syntetyczne (mikrocement, MDF, lakierowane fronty). Mózg odczytuje to jako wizualną monotonię. Wprowadzenie naturalnego materiału z patyną — mosiądz, prawdziwa porcelana, ręcznie wycinane szkło — uruchamia te same neurony, które reagują na drewno w lesie albo kamień nad jeziorem.",
						"To dlatego klienci mówią nam, że po dodaniu jednego antyku „mieszkanie zaczęło oddychać”. Antyk pełni funkcję wizualnego węzła, do którego oko wraca i odpoczywa. W terminologii projektowej to focal point — w terminologii naszych klientek to po prostu „ten przedmiot, do którego się uśmiecham, robiąc kawę”.",
					],
				},
			],
			conclusion:
				"Nie potrzebujesz remontu. Nie potrzebujesz nawet zmiany funkcji pokoju. Potrzebujesz jednego przedmiotu z duszą, który przekierowuje uwagę, podnosi prestiż i daje Ci gotową opowieść dla gości. W naszym sklepie zaczynamy od 95 zł (secesyjne ramki) i kończymy na 2400 zł (sygnowane wazony Augarten). Świeża dostawa z Wiednia raz w miesiącu — można obejrzeć w sklepie w Nowym Targu albo zarezerwować online na 24 godziny.",
			cta: {
				eyebrow: "Polecane do tego artykułu",
				title: "Wazon Rosenthal — Wiedeń, 1934",
				description:
					"Sygnowany, w idealnym stanie, z patyną mosiądzu na podstawie. Klasyczny przykład „jednego przedmiotu”, o którym piszemy w tekście.",
				buttonLabel: "Zobacz wazon",
			},
		},
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
		relatedProductSlug: "filizanka-augarten-secesja-1910",
		bodyExtended: {
			intro:
				"Rosenthal istnieje od 1879 roku, ma w katalogu kilkanaście tysięcy wzorów i kilkanaście serii sygnatur. Na rynku wtórnym (zarówno polskim, jak i niemieckim) krąży sporo podróbek: tańsze fabryki bawarskie z lat 70. udające markę, kopie azjatyckie i świadome przekłamania ceny. Poniżej krótki, ale wystarczający przewodnik dla kupującego, który nie chce zostać oszukany — z naciskiem na trzy testy, które zrobisz w domu w 90 sekund.",
			sections: [
				{
					heading: "Test 1: Sygnatura pod denkiem",
					paragraphs: [
						"Każdy autentyk Rosenthala ma sygnaturę pod spodem. Najpopularniejszy znak rozpoznawczy to dwie skrzyżowane szpady (1907–1956) lub korona z napisem „Rosenthal Bavaria” (1957+). Jeśli widzisz sygnaturę naniesioną tylko piecznym (a nie wypaloną pod glazurą) — to znak ostrzegawczy. Autentyczna sygnatura znajduje się POD warstwą glazury i wyczuwa się ją tylko przez delikatne, gładkie wgłębienie. Sygnatura nadrukowana po wypaleniu jest dotykowo wyczuwalna jako wystająca cienka warstwa.",
						"Drugi znak: numer wzoru i numer formy. Każdy autentyk ma dwa numery — pattern i shape. Jeśli widzisz tylko jeden, sprawdź dokładnie — może to być produkcja licencyjna z lat 80., która miała inne sygnatury. Nasz katalog produktów zawsze podaje pełen numer pattern/shape (kupujący ma prawo wiedzieć).",
					],
				},
				{
					heading: "Test 2: Dźwięk i waga",
					paragraphs: [
						"Stuknij paznokciem w krawędź filiżanki. Autentyczny Rosenthal porcelany twardej dźwięczy długo (3–5 sekund), wysoko, z kryształowym brzmieniem. Tańsze fabryki bawarskie i kopie azjatyckie dźwięczą krótko i głucho — to różnica w masie ceramicznej (kaolin + skaleń + kwarc w odpowiednich proporcjach).",
						"Waga: porcelana twarda Rosenthala jest LŻEJSZA niż się wydaje. Filiżanka 200 ml waży około 110–130 g. Jeśli czujesz w ręku ciężar bliski 200 g — to porcelana miękka, najpewniej kopia. Wytrenowane oko (i dłoń) rozpoznaje to po pierwszym dotknięciu.",
					],
				},
				{
					heading: "Test 3: Krawędź i przezroczystość",
					paragraphs: [
						"Podnieś filiżankę pod światło. Autentyczna porcelana Rosenthal twarda przepuszcza światło na krawędziach — widać delikatną „aurę” w odcieniu mlecznym lub kremowym. To efekt cienkościennej masy ceramicznej (1.5–2.0 mm na krawędzi). Tańsze produkcje są grubsze, mleczniejsze i blokują światło.",
						"Krawędź: autentyk ma krawędź gładką pod palcem, bez chropowatości. Glazura kończy się równomiernie. Kopie często mają mikronierówności wyczuwalne pod paznokciem.",
					],
				},
				{
					heading: "Czego unikać przy zakupie online",
					paragraphs: [
						"Zdjęcia bez sygnatury (sprzedawca nie chce pokazać). Zdjęcia denka pod kątem (ukrywa coś). Cena 30% poniżej rynku — to znak, że albo coś jest nie tak, albo sprzedawca sam dostał taniej i nie wie, co ma. Brak informacji o numerze pattern/shape. Sygnatura tylko opisana słownie bez zdjęcia. „Z bardzo małym obiciem” bez zdjęcia obicia (skala obicia bywa większa).",
						"W RetroHouse wszystkie produkty ze sklepu są kupowane przez nas osobiście w Wiedniu, sygnatury sprawdzane na miejscu, zdjęcia pełne (włącznie z denkiem). Jeżeli kupujesz gdzie indziej — zażądaj zdjęcia denka i porównaj z bazą Rosenthal Marken (rosenthal-marken.de).",
					],
				},
			],
			conclusion:
				"90 sekund testu dotyk/dźwięk/światło wystarczy, żeby odsiać większość fałszywych Rosenthali na rynku wtórnym. Reszta to oryginalne, ale uszkodzone egzemplarze (włos, brak fragmentu, nieczytelna sygnatura) — tych nie sprzedajemy. Jeśli chcesz pewności bez własnego sprawdzania, kup u nas: każda filiżanka, każdy talerz, każdy serwis ma w opisie pełny numer wzoru, datę produkcji i historię pochodzenia. Bezpieczna droga przez sklep z Nowego Targu wygrywa z loterią aukcji.",
			cta: {
				eyebrow: "Sprawdzony autentyk",
				title: "Filiżanka Augarten — Wiedeń, ok. 1910",
				description:
					"Sygnatura skrzyżowane szpady, secesyjny wzór, w idealnym stanie. Odkupiona przez nas bezpośrednio od prywatnego właściciela.",
				buttonLabel: "Zobacz filiżankę",
			},
		},
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
		relatedProductSlug: "lampka-stolowa-mosiezna-1962",
		bodyExtended: {
			intro:
				"Pięć przedmiotów. Pięć budżetów. Pięć efektów. Ten artykuł nie jest abstrakcyjnym przewodnikiem — to lista konkretnych pozycji z naszego aktualnego asortymentu, które już dzisiaj możesz dorzucić do koszyka. Posortowane od najtańszego do najdroższego, z opisem efektu, który dadzą w salonie. Każda pozycja przeszła przez nasze ręce w Wiedniu i ma kartę historii. Zacznijmy.",
			sections: [
				{
					heading: "1. Secesyjna ramka portretowa (95 zł)",
					paragraphs: [
						"Najtańsza pozycja na liście, ale często najczęściej wracają do niej klienci. Secesja wiedeńska około 1905 roku, mosiądz patynowany, w środku zwykle umieszczamy fotografię rodzinną z lat 30. albo czarno-białą reprodukcję z Klimta. Efekt: konsola w przedpokoju przestaje wyglądać jak z IKEA, zaczyna wyglądać jak z mieszkania kogoś, kto „wrócił z Wiednia z czymś specjalnym”.",
						"Praktycznie: wystarczy jedna ramka na widocznym miejscu (konsola, regał z książkami, otwarta półka). Ważne, żeby fotografia w środku była stara lub udawała starą — nowoczesne zdjęcie w ramce z 1905 roku tworzy zgrzyt.",
					],
				},
				{
					heading: "2. Mosiężna lampka stolikowa lat 60. (340 zł)",
					paragraphs: [
						"Ten typ lampki jest naszym hitem w kategorii „mid-century na biurko”. Mosiężna podstawa, abażur z naturalnego lnu, oryginalny przewód tekstylny (w razie potrzeby wymieniamy na nowy z certyfikatem CE). Pasuje do każdego biurka — drewnianego, lakierowanego, mikrocementu. Ciepłe światło 2700 K (zalecamy żarówkę LED o tej barwie) zmienia atmosferę pokoju z neutralnej na „kawiarniana”.",
						"To klasyczny przedmiot, od którego zaczyna się historia z vintage. Wystarczy postawić go na biurku, żeby cała przestrzeń zaczęła czytać się inaczej. W naszym sklepie często zaczyna od niego klientka, która później wraca po komplet kieliszków albo wazon — estetyka domaga się dopełnienia.",
					],
				},
				{
					heading: "3. Karafka szklana ręcznie rzeźbiona z lat 40. (520 zł)",
					paragraphs: [
						"Karafka, której nie postawi się w sklepie z dekoracjami nowoczesnymi. Ręczne rzeźbienie szkła to technika, która wymarła w Polsce w latach 80. (taniej było produkować maszynowo). W Austrii, Czechach i na Morawach kilka warsztatów przetrwało, ale po cenach hurtowych już nieosiągalnych. Nasz egzemplarz z 1940 roku ma cztery koncentryczne pierścienie + grawerunek inicjałów rodziny pierwotnego właściciela.",
						"Funkcjonalnie: świetnie sprawdza się jako karafka na wodę przy stole jadalnym albo na whisky w gabinecie. Wizualnie: jest to obiekt rzeźbiarski, który można też po prostu postawić na półce.",
					],
				},
				{
					heading: "4. Krzesło Thonet kawiarniane z 1925 (890 zł)",
					paragraphs: [
						"Thonet to marka, która wymyśliła krzesło z giętego drewna i wprowadziła je do wiedeńskich kawiarni jeszcze przed I wojną światową. Każde autentyczne krzesło Thonet ma wypalaną sygnaturę pod siedzeniem, oryginalne obijanie z trzciny (lub jej odtworzenie) i charakterystyczne elementy strukturalne, które odróżniają go od współczesnych kopii. Nasze egzemplarze pozyskujemy z prywatnych mieszkań — głównie po remontach, kiedy właściciele decydują się na nowe meble.",
						"Krzesło Thonet sprawdza się świetnie jako jedno krzesło przy biurku albo jako akcent w jadalni (gdzie reszta krzeseł jest nowoczesna). Lekkie, naprawialne, ze standardowymi częściami zamiennymi — to mebel pomyślany na dekady.",
					],
				},
				{
					heading: "5. Wazon Rosenthal Art Deco z 1934 (2400 zł)",
					paragraphs: [
						"Najwyższa półka. Sygnowany, idealnie zachowany, w oryginalnym pudełku Rosenthala (rzadkość — większość wazonów z lat 30. straciła pudełka). Jeśli masz salon z dużym stołem albo otwartą jadalnią, wazon staje się centralnym punktem aranżacji. Nie jest to wydatek dla każdego — ale dla osób, które myślą o przedmiotach jako o lokacie wartości, sygnowane Rosenthale Art Deco trzymają cenę na rynku kolekcjonerskim od lat.",
						"Praktyczny tip: nie polecamy stawiać świeżych kwiatów w sygnowanej porcelanie z lat 30. (woda + glazura porowata = ryzyko mikropęknięć). Wazon dekoracyjny stawiamy z gałęziami suszonymi albo same, jako obiekt rzeźbiarski.",
					],
				},
			],
			conclusion:
				"Pięć kroków, pięć budżetów, jeden efekt — salon, który ma duszę i o którym goście pytają. Zacznij od najtańszej pozycji (95 zł) lub od średniej (340 zł), zobacz, jak zmienia odbiór pokoju, i wracaj po kolejne. W naszym sklepie w Nowym Targu wszystkie pozycje można zobaczyć osobiście, a online — zarezerwować na 24 godziny. Świeża dostawa z Wiednia raz w miesiącu — zapisz się na newsletter, jeśli chcesz wiedzieć pierwszy.",
			cta: {
				eyebrow: "Średnia półka — start polecany",
				title: "Lampka stolikowa mosiężna z lat 60.",
				description:
					"Druga pozycja z listy w tekście. Mosiądz patynowany, len naturalny, dostępna od ręki w sklepie i online.",
				buttonLabel: "Zobacz lampkę",
			},
		},
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
		heroHue: "oklch(0.55 0.08 50)",
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
		heroHue: "oklch(0.52 0.15 38)",
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
		heroHue: "oklch(0.39 0.07 45)",
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
		heroHue: "oklch(0.86 0.03 75)",
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

/** Najnowsze posty po dacie publikacji — do bocznej kolumny bloga. */
export function getLatestPosts(limit = 3, excludeSlug?: string): Post[] {
	return [...POSTS]
		.filter((post) => (excludeSlug ? post.slug !== excludeSlug : true))
		.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
		.slice(0, limit);
}
