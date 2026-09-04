import type { GlobalContent, HeroContent, PageContentMap, SiteSettings } from "./types";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
	title: "RetroHouse \u2014 Antyki z prawdziw\u0105 histori\u0105",
	description:
		"Antyki z wiede\u0144skich kamienic. Porcelana, szk\u0142o, dekoracje, meble. Sklep w Nowym Targu i wysy\u0142ka po ca\u0142ej Polsce.",
	titleTemplate: "%s | RetroHouse",
};

export const DEFAULT_HOME_HERO: HeroContent = {
	headline: "Antyki z\u00a0prawdziw\u0105 histori\u0105",
	subLead: "Prosto z\u00a0Wiednia",
	description:
		"Zero po\u015brednik\u00f3w, 100% pewno\u015b\u0107 pochodzenia. Sklep w\u00a0Nowym Targu i\u00a0wysy\u0142ka po\u00a0ca\u0142ej Polsce.",
	ctaLabel: "POZNAJ NAS",
	ctaHref: "#home-kategorie",
	ctaSecondaryLabel: "ZOBACZ SKLEP",
	ctaSecondaryHref: "/sklep",
};

export const DEFAULT_PAGE_CONTENT_MAP: PageContentMap = {
	home: { hero: DEFAULT_HOME_HERO },
};

export const DEFAULT_GLOBAL_CONTENT: GlobalContent = {};
