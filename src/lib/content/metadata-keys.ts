import type { ContentPageId } from "./types";

/** Klucze w `Store.metadata` Medusa — przestrzeń nazw RetroHouse CMS. */
export const RETROHOUSE_SITE_SETTINGS_KEY = "retrohouse_site_settings";
export const RETROHOUSE_PAGE_CONTENT_KEY = "retrohouse_page_content";
export const RETROHOUSE_PAGE_SEO_KEY = "retrohouse_page_seo";
export const RETROHOUSE_GLOBAL_CONTENT_KEY = "retrohouse_global_content";

/** Cache tag dla `revalidateTag` — inwalidacja po zapisie z panelu. */
export const RETROHOUSE_CONTENT_CACHE_TAG = "retrohouse-content";

/** Bloki edytowalne per podstrona — zgodnie z układem Moduly CMS. */
export type ContentBlockKey = "hero" | "faq";

export type CmsPageConfig = {
	id: ContentPageId;
	label: string;
	path: string;
	blocks: ContentBlockKey[];
};

/** Definicja stron CMS — używana w admin panelu i revalidatePath. */
export const CMS_PAGES: CmsPageConfig[] = [
	{ id: "home", label: "Strona główna", path: "/", blocks: ["hero"] },
	{ id: "o-nas", label: "O nas", path: "/o-nas", blocks: ["hero"] },
	{ id: "prezent", label: "Prezenty", path: "/prezent", blocks: ["hero"] },
	{ id: "kontakt", label: "Kontakt", path: "/kontakt", blocks: ["hero", "faq"] },
];

export const CMS_BASE_PATH = "/magazyn/cms";

export const SETTINGS_BASE_PATH = "/magazyn/ustawienia";
export const SETTINGS_SEO_BASE_PATH = `${SETTINGS_BASE_PATH}/seo`;
