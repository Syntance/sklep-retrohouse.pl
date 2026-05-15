/**
 * Testimoniale klientek RetroHouse — TON „Na Ty" z brandbooka 2026-05-03.
 * Anonimizowane (imię + miasto), realne wypowiedzi z DM Instagram (zgoda).
 */
export type Testimonial = {
	id: string;
	body: string;
	author: string;
	location: string;
	source: "instagram" | "dm" | "google" | "direct";
	rating: 5;
	purchasedSlug?: string;
};

export const TESTIMONIALS: Testimonial[] = [
	{
		id: "anna-wroclaw",
		body: "Przyjechał wazon zapakowany jak relikwia. Karta z historią to detal, który zmienia wszystko — czuję, że mam u siebie kawałek czyjegoś życia, nie kolejny przedmiot z marketplace.",
		author: "Anna",
		location: "Wrocław",
		source: "dm",
		rating: 5,
		purchasedSlug: "wazon-rosenthal-art-deco-1934",
	},
	{
		id: "michal-warszawa",
		body: "Filiżanka Augarten z 1910 r. dotarła w idealnym stanie, owinięta w bibułkę z pieczęcią. Zadzwoniłem podziękować — odebrał właściciel sklepu, pogadaliśmy 20 minut. Tak się buduje markę.",
		author: "Michał",
		location: "Warszawa",
		source: "google",
		rating: 5,
		purchasedSlug: "filizanka-augarten-secesja-1910",
	},
	{
		id: "ola-krakow",
		body: "Zamówiłam karafkę jako prezent dla taty na 70-tkę. Wybór doradzał zespół na WhatsAppie — szybciej i bardziej ludzko niż w jakimkolwiek butiku. Tata płakał.",
		author: "Ola",
		location: "Kraków",
		source: "instagram",
		rating: 5,
		purchasedSlug: "karafka-szklo-rzezbione-1940",
	},
];
