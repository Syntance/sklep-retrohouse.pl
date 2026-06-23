import "server-only";

import { cache } from "react";
import { env } from "@/env";
import { MEDUSA_BASE_URL, loginWithEmailPassword } from "@/lib/admin/medusa-admin";
import {
	RETROHOUSE_SITE_SETTINGS_KEY,
	RETROHOUSE_PAGE_CONTENT_KEY,
	RETROHOUSE_PAGE_SEO_KEY,
	RETROHOUSE_GLOBAL_CONTENT_KEY,
	RETROHOUSE_CONTENT_CACHE_TAG,
} from "./metadata-keys";
import {
	parseSiteSettings,
	parsePageContentMap,
	parsePageSeoMap,
	parseGlobalContent,
} from "./parsers";
import {
	DEFAULT_SITE_SETTINGS,
	DEFAULT_PAGE_CONTENT_MAP,
	DEFAULT_GLOBAL_CONTENT,
} from "./defaults";
import type { SiteSettings, PageContentMap, PageSeoMap, GlobalContent } from "./types";

type StoreMetadataBlob = {
	siteSettings: SiteSettings;
	pageContentMap: PageContentMap;
	pageSeoMap: PageSeoMap;
	globalContent: GlobalContent;
};

type MedusaStore = {
	id: string;
	metadata?: Record<string, unknown> | null;
};

const FALLBACK: StoreMetadataBlob = {
	siteSettings: DEFAULT_SITE_SETTINGS,
	pageContentMap: DEFAULT_PAGE_CONTENT_MAP,
	pageSeoMap: {},
	globalContent: DEFAULT_GLOBAL_CONTENT,
};

/* In-memory token cache — TTL 55 min (Medusa JWT ~24h, odświeżamy z zapasem). */
let _serviceToken: { token: string; at: number } | null = null;

async function getServiceToken(): Promise<string | null> {
	const email = env.MEDUSA_ADMIN_EMAIL;
	const password = env.MEDUSA_ADMIN_PASSWORD;
	if (!email || !password) return null;

	if (_serviceToken && Date.now() - _serviceToken.at < 55 * 60 * 1000) {
		return _serviceToken.token;
	}

	try {
		const token = await loginWithEmailPassword(email, password);
		_serviceToken = { token, at: Date.now() };
		return token;
	} catch {
		return null;
	}
}

/**
 * Pobiera Store.metadata z Medusa Admin API.
 * ISR: revalidate 3600s + tag `retrohouse-content`.
 * React.cache() deduplikuje per drzewo renderowania.
 * Fallback na defaults gdy brak credentials lub Medusa niedostępna.
 */
export const fetchStoreMetadataBlob = cache(async (): Promise<StoreMetadataBlob> => {
	const token = await getServiceToken();
	if (!token) return FALLBACK;

	try {
		const res = await fetch(
			`${MEDUSA_BASE_URL}/admin/stores?limit=1&fields=id,metadata`,
			{
				headers: { Authorization: `Bearer ${token}` },
				next: {
					revalidate: 3600,
					tags: [RETROHOUSE_CONTENT_CACHE_TAG],
				},
				signal: AbortSignal.timeout(30_000),
			},
		);

		if (!res.ok) return FALLBACK;

		const data = (await res.json()) as { stores: MedusaStore[] };
		const metadata = data.stores[0]?.metadata ?? {};

		return {
			siteSettings:
				parseSiteSettings(metadata[RETROHOUSE_SITE_SETTINGS_KEY]) ??
				DEFAULT_SITE_SETTINGS,
			pageContentMap:
				parsePageContentMap(metadata[RETROHOUSE_PAGE_CONTENT_KEY]) ??
				DEFAULT_PAGE_CONTENT_MAP,
			pageSeoMap: parsePageSeoMap(metadata[RETROHOUSE_PAGE_SEO_KEY]) ?? {},
			globalContent:
				parseGlobalContent(metadata[RETROHOUSE_GLOBAL_CONTENT_KEY]) ??
				DEFAULT_GLOBAL_CONTENT,
		};
	} catch {
		return FALLBACK;
	}
});
