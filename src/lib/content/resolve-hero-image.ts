import type { HeroProductImage } from "@/lib/sanity/home-hero";
import { DEFAULT_HERO_PRODUCT } from "@/lib/sanity/home-hero";
import { resolveCmsMediaPublicUrl } from "./cms-media-url";
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

const O_NAS_FALLBACK: HeroProductImage = {
	src: PAGE_HERO_IMAGES.oNas.src,
	alt: PAGE_HERO_IMAGES.oNas.alt,
	width: 1200,
	height: 1500,
};

const PAGE_ALT_FALLBACK: Partial<Record<CmsHeroPageKey, string>> = {
	home: "RetroHouse — hero",
	prezent: PAGE_HERO_IMAGES.prezent.alt,
	"o-nas": PAGE_HERO_IMAGES.oNas.alt,
};

function preferLiveCmsImages(): boolean {
	return process.env.NODE_ENV === "development";
}

function resolveLiveCmsProductImage(
	cmsHero: Partial<HeroContent> | undefined,
	pageKey: CmsHeroPageKey,
): HeroProductImage | null {
	const liveUrl = resolveCmsMediaPublicUrl(cmsHero?.productImageUrl);
	if (!liveUrl) return null;

	return {
		src: liveUrl,
		alt: cmsHero?.productImageAlt?.trim() || PAGE_ALT_FALLBACK[pageKey] || "RetroHouse",
		width: cmsHero?.productImageWidth ?? 1200,
		height: cmsHero?.productImageHeight ?? 1500,
	};
}

/**
 * Obraz hero: na localhost live z CMS (R2), na produkcji — pliki z ostatniego buildu (`/images/cms/…`).
 */
export function resolveStaticHeroProductImage(
	pageKey: CmsHeroPageKey,
	cmsHero?: Partial<HeroContent>,
): HeroProductImage | null {
	if (preferLiveCmsImages()) {
		const live = resolveLiveCmsProductImage(cmsHero, pageKey);
		if (live) return live;
	}

	const baked = STATIC_CMS_HERO[pageKey];
	if (!baked?.productImageUrl) {
		if (pageKey === "prezent") return PREZENT_FALLBACK;
		if (pageKey === "o-nas") return O_NAS_FALLBACK;
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
