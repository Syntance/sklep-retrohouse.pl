import "server-only";

import { cache } from "react";
import { fetchStoreMetadataBlob } from "./admin-read";
import { DEFAULT_HOME_HERO } from "./defaults";
import { normalizeSocialLinks } from "./social-links";
import type { ContentPageId, PageContent, SiteSettings } from "./types";

/**
 * Globalne ustawienia witryny (tytuł, opis, announcement bar, social links).
 * Fallback: DEFAULT_SITE_SETTINGS.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
	const { siteSettings } = await fetchStoreMetadataBlob();
	return {
		...siteSettings,
		socialLinks: normalizeSocialLinks(siteSettings.socialLinks),
	};
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
