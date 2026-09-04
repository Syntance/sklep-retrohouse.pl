import type { HeroContent, PageContentMap } from "./types";

function stripHeroProductImage(
	hero: Partial<HeroContent> | undefined,
): Partial<HeroContent> | undefined {
	if (!hero) return undefined;
	const {
		productImageUrl: _url,
		productImageAlt: _alt,
		productImageWidth: _w,
		productImageHeight: _h,
		...rest
	} = hero;
	return Object.keys(rest).length > 0 ? rest : undefined;
}

/** Jednorazowa migracja: zdjęcie hero z /kontakt → /o-nas (legacy metadata). */
export function migrateKontaktHeroToONas(map: PageContentMap): PageContentMap {
	const kontaktUrl = map.kontakt?.hero?.productImageUrl?.trim();
	if (!kontaktUrl) return map;

	const oNas = map["o-nas"] ?? {};
	const oNasHero = oNas.hero ?? {};
	const kontaktHero = map.kontakt?.hero;

	const next: PageContentMap = { ...map };

	if (!oNasHero.productImageUrl?.trim()) {
		next["o-nas"] = {
			...oNas,
			hero: {
				...oNasHero,
				productImageUrl: kontaktUrl,
				productImageAlt: kontaktHero?.productImageAlt ?? oNasHero.productImageAlt,
				productImageWidth: kontaktHero?.productImageWidth ?? oNasHero.productImageWidth,
				productImageHeight: kontaktHero?.productImageHeight ?? oNasHero.productImageHeight,
			},
		};
	}

	next.kontakt = {
		...map.kontakt,
		hero: stripHeroProductImage(kontaktHero),
	};

	return next;
}

export function pageContentMapNeedsHeroMigration(map: PageContentMap): boolean {
	return Boolean(map.kontakt?.hero?.productImageUrl?.trim());
}
