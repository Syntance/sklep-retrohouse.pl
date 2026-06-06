import { EMAIL_B2B, EMAIL_CONTACT } from "@/lib/email/constants";

export type NavLink = {
	label: string;
	href: string;
	description?: string;
	external?: boolean;
};

export type NavGroup = {
	heading: string;
	items: NavLink[];
};

export const PRIMARY_NAV: NavLink[] = [
	{ label: "Sklep", href: "/sklep" },
	{ label: "Prezent z duszą", href: "/prezent" },
	{ label: "O nas", href: "/o-nas" },
	{ label: "Blog", href: "/blog" },
	{ label: "Kontakt", href: "/kontakt" },
];

export const SHOP_MEGA_MENU: NavGroup[] = [
	{
		heading: "Kategorie",
		items: [
			{
				label: "Porcelana",
				href: "/sklep?kategoria=porcelana",
				description: "Augarten, Rosenthal, serwisy",
			},
			{
				label: "Szkło",
				href: "/sklep?kategoria=szklo",
				description: "Karafki, kieliszki, wazony",
			},
			{
				label: "Dekoracje",
				href: "/sklep?kategoria=dekoracje",
				description: "Figurki, ramki, zegary",
			},
			{
				label: "Meble",
				href: "/sklep?kategoria=meble",
				description: "Drobne, lampy, krzesła",
			},
			{
				label: "Obrazy",
				href: "/sklep?kategoria=obrazy",
				description: "Grafiki, akwarele, oleje",
			},
		],
	},
	{
		heading: "Popularne",
		items: [
			{ label: "Nowości", href: "/sklep?sort=najnowsze" },
			{ label: "Bestsellery", href: "/sklep?sort=popularne" },
			{ label: "Świeża dostawa z Wiednia", href: "/sklep?badge=fresh" },
		],
	},
	{
		heading: "Info",
		items: [
			{ label: "Wysyłka i zwroty", href: "/wysylka" },
			{ label: "Zapytaj o przedmiot", href: "/kontakt" },
			{ label: "Dla projektantów", href: "/dla-projektantow" },
		],
	},
];

export const FOOTER_COLUMNS: NavGroup[] = [
	{
		heading: "Sklep",
		items: [
			{ label: "Wszystkie skarby", href: "/sklep" },
			{ label: "Prezent z duszą", href: "/prezent" },
			{ label: "Moje konto", href: "/konto" },
			{ label: "Dla projektantów", href: "/dla-projektantow" },
		],
	},
	{
		heading: "O sklepie",
		items: [
			{ label: "Nasza historia", href: "/o-nas" },
			{ label: "Blog", href: "/blog" },
			{ label: "Wysyłka i zwroty", href: "/wysylka" },
			{ label: "Kontakt", href: "/kontakt" },
		],
	},
	{
		heading: "Formalności",
		items: [
			{ label: "Regulamin", href: "/regulamin" },
			{ label: "Polityka prywatności", href: "/polityka-prywatnosci" },
			{ label: "Polityka cookies", href: "/polityka-cookies" },
			{ label: "Reklamacje", href: "/reklamacje" },
			{ label: "Odstąpienie od umowy", href: "/odstapienie" },
			{ label: "Deklaracja dostępności", href: "/deklaracja-dostepnosci" },
		],
	},
];

export const STORE_INFO = {
	name: "RetroHouse",
	address: "Nowy Targ, Podhale",
	streetAddress: "ul. Ludźmierska 25A",
	postalCode: "34-400",
	city: "Nowy Targ",
	country: "PL",
	geo: { lat: 49.475, lng: 20.028 },
	hours: "wt–pt 11:00–18:00 · sob 10:00–14:00",
	email: EMAIL_CONTACT,
	emailB2B: EMAIL_B2B,
	phone: "+48 530 062 677",
	whatsapp: "+48 530 062 677",
	instagram: "@retrohouse",
	instagramHref: "https://instagram.com/retrohouse",
	facebookHref: "https://facebook.com/retrohouse",
	mapsHref: "https://maps.google.com/?q=ul.+Lud%C5%BAmierska+25A,+34-400+Nowy+Targ",
	googleMapsEmbedSrc:
		"https://www.google.com/maps?q=ul.+Lud%C5%BAmierska+25A,+34-400+Nowy+Targ&z=15&output=embed",
	googleReviewsHref:
		"https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuFkcRmSrV3Vo8AAQ",
	madeBy: "Syntance.com",
	madeByHref: "https://syntance.com",
};
