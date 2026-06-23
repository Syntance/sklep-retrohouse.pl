/** Max dłuższy bok hero po sync/build (WebP q92). */
export const CMS_HERO_MAX_LONG_EDGE = 1920;

export const CMS_HERO_WEBP_QUALITY = 92;

/** Stałe nazwy plików hero w `public/images/cms/` — sync podmienia przy buildzie. */
export const CMS_HERO_STATIC_FILES = {
	home: "home-hero.webp",
	prezent: "prezent-hero.webp",
} as const;

export type CmsHeroPageKey = keyof typeof CMS_HERO_STATIC_FILES;
