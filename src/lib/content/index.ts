import "server-only";

import { cache } from "react";
import { fetchStoreMetadataBlob } from "./admin-read";
import { DEFAULT_HOME_HERO, DEFAULT_GLOBAL_CONTENT, DEFAULT_SITE_SETTINGS } from "./defaults";
import type { ContentPageId, SiteSettings, PageContent, SeoMeta, GlobalContent } from "./types";

export type { ContentPageId, SiteSettings, PageContent, SeoMeta, GlobalContent };
export type { HeroContent, FaqItem, PageSeoMap, PageContentMap, AnnouncementBar, SocialLinks } from "./types";

/**
 * Globalne ustawienia witryny (tytuł, opis, announcement bar, social links).
 * Fallback: DEFAULT_SITE_SETTINGS.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
	const { siteSettings } = await fetchStoreMetadataBlob();
	return siteSettings;
});

/**
 * SEO dla konkretnej podstrony.
 */
export const getPageSeo = cache(async (pageId: ContentPageId): Promise<SeoMeta | undefined> => {
	const { pageSeoMap } = await fetchStoreMetadataBlob();
	return pageSeoMap[pageId];
});

/**
 * Treść bloków dla podstrony (hero, faq…).
 * Fallback: puste bloki (hero ze strony głównej ma DEFAULT_HOME_HERO).
 */
export const getPageContent = cache(async (pageId: ContentPageId): Promise<PageContent> => {
	const { pageContentMap } = await fetchStoreMetadataBlob();
	const page = pageContentMap[pageId];

	if (pageId === "home") {
		return {
			...page,
			hero: page?.hero ?? DEFAULT_HOME_HERO,
		};
	}

	return page ?? {};
});

/**
 * Globalna treść współdzielona (announcement bar).
 */
export const getGlobalContent = cache(async (): Promise<GlobalContent> => {
	const { globalContent } = await fetchStoreMetadataBlob();
	return globalContent ?? DEFAULT_GLOBAL_CONTENT;
});

export { DEFAULT_HOME_HERO, DEFAULT_SITE_SETTINGS, DEFAULT_GLOBAL_CONTENT };
