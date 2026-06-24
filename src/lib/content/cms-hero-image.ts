/** Max dłuższy bok obrazu CMS (upload + sync/build). */
export const CMS_HERO_MAX_LONG_EDGE = 1920;

/** WebP q92 — praktycznie bez widocznej straty, ~60–80% mniej niż JPEG z aparatu. */
export const CMS_HERO_WEBP_QUALITY = 92;

/** Stałe nazwy plików hero w `public/images/cms/` — sync podmienia przy buildzie. */
export const CMS_HERO_STATIC_FILES = {
	home: "home-hero.webp",
	prezent: "prezent-hero.webp",
} as const;

export type CmsHeroPageKey = keyof typeof CMS_HERO_STATIC_FILES;
