/**
 * Hero — statyczne zdjęcia w `public/images/hero/`.
 * Podmień pliki bez zmiany kodu (np. prezent.jpg, o-nas.jpg).
 */
export const PAGE_HERO_IMAGES = {
	prezent: {
		src: "/images/hero/prezent.jpg",
		alt: "Prezent z duszą — antyki RetroHouse",
	},
	oNas: {
		src: "/images/hero/o-nas.jpg",
		alt: "RetroHouse — odkup antyków z wiedeńskich kamienic",
	},
} as const;
