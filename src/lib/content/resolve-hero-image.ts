import type { HeroProductImage } from "@/lib/sanity/home-hero";
import { DEFAULT_HERO_PRODUCT } from "@/lib/sanity/home-hero";
import type { CmsHeroPageKey } from "./cms-hero-image";
import { PAGE_HERO_IMAGES } from "./hero-images";
import { STATIC_CMS_HERO } from "./static-cms-hero";
import type { HeroContent } from "./types";

const PREZENT_FALLBACK: HeroProductImage = {
	src: PAGE_HERO_IMAGES.prezent.src,
	alt: PAGE_HERO_IMAGES.prezent.alt,
	width: 1200,
	height: 1500,
};

const KONTAKT_FALLBACK: HeroProductImage = {
	src: PAGE_HERO_IMAGES.kontakt.src,
	alt: PAGE_HERO_IMAGES.kontakt.alt,
	width: 1200,
	height: 1500,
};

/**
 * Obraz hero z ostatniego buildu (`/images/cms/…`).
 * Tekst alt może pochodzić live z CMS (revalidate) — src zawsze lokalny po redeploy.
 */
export function resolveStaticHeroProductImage(
	pageKey: CmsHeroPageKey,
	cmsHero?: Partial<HeroContent>,
): HeroProductImage | null {
	const baked = STATIC_CMS_HERO[pageKey];
	if (!baked?.productImageUrl) {
		if (pageKey === "prezent") return PREZENT_FALLBACK;
		if (pageKey === "kontakt") return KONTAKT_FALLBACK;
		return null;
	}

	return {
		src: baked.productImageUrl,
		alt: cmsHero?.productImageAlt?.trim() || baked.productImageAlt,
		width: cmsHero?.productImageWidth ?? baked.productImageWidth,
		height: cmsHero?.productImageHeight ?? baked.productImageHeight,
	};
}

/** Kolejność: static CMS → (home) Sanity → domyślne. */
export function resolveHomeHeroProductImage(
	cmsHero: Partial<HeroContent> | undefined,
	sanityFallback: HeroProductImage | null,
): HeroProductImage {
	return (
		resolveStaticHeroProductImage("home", cmsHero) ??
		sanityFallback ??
		DEFAULT_HERO_PRODUCT
	);
}
