import "server-only";

import { adminFetch } from "./medusa-admin";
import {
	RETROHOUSE_SITE_SETTINGS_KEY,
	RETROHOUSE_PAGE_CONTENT_KEY,
	RETROHOUSE_PAGE_SEO_KEY,
	RETROHOUSE_GLOBAL_CONTENT_KEY,
} from "@/lib/content/metadata-keys";
import { siteSettingsSchema } from "@/lib/content/parsers";
import { normalizeSocialLinks } from "@/lib/content/social-links";
import { DEFAULT_SITE_SETTINGS } from "@/lib/content/defaults";
import { resolveCmsMediaPublicUrl } from "@/lib/content/cms-media-url";
import { parseStoreMetadataJson } from "@/lib/content/metadata-json";
import {
	migrateKontaktHeroToONas,
	pageContentMapNeedsHeroMigration,
} from "@/lib/content/migrate-hero-pages";
import type {
	PageSeoMap,
	SeoMeta,
	SiteSettings,
	PageContent,
	PageContentMap,
	GlobalContent,
	ContentPageId,
} from "@/lib/content/types";

type MedusaStore = {
	id: string;
	metadata?: Record<string, unknown> | null;
};

async function getStore(): Promise<MedusaStore> {
	const data = await adminFetch<{ stores: MedusaStore[] }>(
		"/admin/stores?limit=1&fields=id,metadata",
	);
	const store = data.stores[0];
	if (!store) throw new Error("Nie znaleziono sklepu w Medusa.");
	return store;
}

async function patchStoreMetadata(
	storeId: string,
	currentMetadata: Record<string, unknown> | null | undefined,
	key: string,
	value: string,
): Promise<void> {
	await adminFetch(`/admin/stores/${storeId}`, {
		method: "POST",
		body: JSON.stringify({
			metadata: {
				...(currentMetadata ?? {}),
				[key]: value,
			},
		}),
	});
}

/* ── Site Settings ─────────────────────────────────────────────────────── */

export async function readSiteSettings(): Promise<SiteSettings | null> {
	const store = await getStore();
	const raw = store.metadata?.[RETROHOUSE_SITE_SETTINGS_KEY];
	if (typeof raw !== "string") return null;
	try {
		return JSON.parse(raw) as SiteSettings;
	} catch {
		return null;
	}
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
	const store = await getStore();
	await patchStoreMetadata(
		store.id,
		store.metadata,
		RETROHOUSE_SITE_SETTINGS_KEY,
		JSON.stringify(settings),
	);
}

/** Read-modify-write: nakłada wybrane pola bez kasowania pozostałych ustawień witryny. */
export async function mergeSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
	const store = await getStore();
	const current =
		parseSiteSettingsFromStore(store.metadata?.[RETROHOUSE_SITE_SETTINGS_KEY]) ??
		DEFAULT_SITE_SETTINGS;

	const merged: SiteSettings = { ...current, ...patch };
	if (patch.socialLinks !== undefined) {
		merged.socialLinks = normalizeSocialLinks(patch.socialLinks);
	}
	const parsed = siteSettingsSchema.parse(merged);
	await patchStoreMetadata(
		store.id,
		store.metadata,
		RETROHOUSE_SITE_SETTINGS_KEY,
		JSON.stringify(parsed),
	);
	return parsed;
}

function parseSiteSettingsFromStore(raw: unknown): SiteSettings | null {
	if (typeof raw !== "string") return null;
	try {
		const parsed = JSON.parse(raw) as unknown;
		const result = siteSettingsSchema.safeParse(parsed);
		return result.success ? result.data : null;
	} catch {
		return null;
	}
}

/* ── Page Content ──────────────────────────────────────────────────────── */

function normalizeHeroMediaUrl(url: string | undefined): string | undefined {
	if (!url) return undefined;
	return resolveCmsMediaPublicUrl(url) ?? url;
}

function normalizePageContent(content: PageContent): PageContent {
	const hero = content.hero;
	if (!hero) return content;

	const productImageUrl = normalizeHeroMediaUrl(hero.productImageUrl);
	const backgroundImageUrl = normalizeHeroMediaUrl(hero.backgroundImageUrl);

	if (
		productImageUrl === hero.productImageUrl &&
		backgroundImageUrl === hero.backgroundImageUrl
	) {
		return content;
	}

	return {
		...content,
		hero: { ...hero, productImageUrl, backgroundImageUrl },
	};
}

function normalizePageContentMap(map: PageContentMap): PageContentMap {
	const out: PageContentMap = {};
	for (const [pageId, content] of Object.entries(map)) {
		out[pageId as ContentPageId] = normalizePageContent(content);
	}
	return out;
}

function parsePageContentMapFromRaw(raw: unknown): PageContentMap {
	const parsed = parseStoreMetadataJson<PageContentMap>(raw);
	if (!parsed || typeof parsed !== "object") return {};
	return migrateKontaktHeroToONas(normalizePageContentMap(parsed));
}

async function readPageContentMap(): Promise<PageContentMap> {
	const store = await getStore();
	return parsePageContentMapFromRaw(store.metadata?.[RETROHOUSE_PAGE_CONTENT_KEY]);
}

export async function readPageContent(pageId: ContentPageId): Promise<PageContent | null> {
	const map = await readPageContentMap();
	return map[pageId] ?? null;
}

export async function savePageContent(
	pageId: ContentPageId,
	content: PageContent,
): Promise<void> {
	const store = await getStore();
	const currentMap = parsePageContentMapFromRaw(store.metadata?.[RETROHOUSE_PAGE_CONTENT_KEY]);
	const nextMap: PageContentMap = {
		...currentMap,
		[pageId]: normalizePageContent(content),
	};
	await patchStoreMetadata(
		store.id,
		store.metadata,
		RETROHOUSE_PAGE_CONTENT_KEY,
		JSON.stringify(nextMap),
	);
}

export async function savePageHeroImage(
	pageId: ContentPageId,
	patch: { productImageUrl: string; productImageAlt?: string },
): Promise<void> {
	const store = await getStore();
	const currentMap = parsePageContentMapFromRaw(store.metadata?.[RETROHOUSE_PAGE_CONTENT_KEY]);
	const currentPage = currentMap[pageId] ?? {};
	const currentHero = currentPage.hero ?? {};
	const resolvedUrl =
		resolveCmsMediaPublicUrl(patch.productImageUrl) ?? patch.productImageUrl.trim();

	const nextPage: PageContent = normalizePageContent({
		...currentPage,
		hero: {
			...currentHero,
			productImageUrl: resolvedUrl,
			...(patch.productImageAlt !== undefined
				? { productImageAlt: patch.productImageAlt }
				: {}),
		},
	});

	const nextMap: PageContentMap = {
		...currentMap,
		[pageId]: nextPage,
	};

	await patchStoreMetadata(
		store.id,
		store.metadata,
		RETROHOUSE_PAGE_CONTENT_KEY,
		JSON.stringify(nextMap),
	);
}

export async function savePageHeroBackground(
	pageId: ContentPageId,
	patch: { backgroundImageUrl: string; backgroundImageAlt?: string },
): Promise<void> {
	const store = await getStore();
	const currentMap = parsePageContentMapFromRaw(store.metadata?.[RETROHOUSE_PAGE_CONTENT_KEY]);
	const currentPage = currentMap[pageId] ?? {};
	const currentHero = currentPage.hero ?? {};
	const resolvedUrl =
		resolveCmsMediaPublicUrl(patch.backgroundImageUrl) ?? patch.backgroundImageUrl.trim();

	const nextPage: PageContent = normalizePageContent({
		...currentPage,
		hero: {
			...currentHero,
			backgroundImageUrl: resolvedUrl,
			...(patch.backgroundImageAlt !== undefined
				? { backgroundImageAlt: patch.backgroundImageAlt }
				: {}),
		},
	});

	const nextMap: PageContentMap = {
		...currentMap,
		[pageId]: nextPage,
	};

	await patchStoreMetadata(
		store.id,
		store.metadata,
		RETROHOUSE_PAGE_CONTENT_KEY,
		JSON.stringify(nextMap),
	);
}

/* ── Page SEO ──────────────────────────────────────────────────────────── */

async function readPageSeoMap(): Promise<PageSeoMap> {
	const store = await getStore();
	const raw = store.metadata?.[RETROHOUSE_PAGE_SEO_KEY];
	if (typeof raw !== "string") return {};
	try {
		return JSON.parse(raw) as PageSeoMap;
	} catch {
		return {};
	}
}

export async function savePageSeo(pageId: ContentPageId, seo: SeoMeta): Promise<void> {
	const store = await getStore();
	const currentMap = await readPageSeoMap();
	const nextMap: PageSeoMap = { ...currentMap, [pageId]: seo };
	await patchStoreMetadata(
		store.id,
		store.metadata,
		RETROHOUSE_PAGE_SEO_KEY,
		JSON.stringify(nextMap),
	);
}

/* ── Global Content ────────────────────────────────────────────────────── */

export async function readGlobalContent(): Promise<GlobalContent | null> {
	const store = await getStore();
	const raw = store.metadata?.[RETROHOUSE_GLOBAL_CONTENT_KEY];
	if (typeof raw !== "string") return null;
	try {
		return JSON.parse(raw) as GlobalContent;
	} catch {
		return null;
	}
}

export async function saveGlobalContent(content: GlobalContent): Promise<void> {
	const store = await getStore();
	await patchStoreMetadata(
		store.id,
		store.metadata,
		RETROHOUSE_GLOBAL_CONTENT_KEY,
		JSON.stringify(content),
	);
}

/* ── Full admin read (dla panelu CMS) ───────────────────────────────────── */

export type AdminCmsSnapshot = {
	siteSettings: SiteSettings | null;
	pageContentMap: PageContentMap;
	globalContent: GlobalContent | null;
	pageSeoMap: PageSeoMap;
};

export async function readAdminCmsSnapshot(): Promise<AdminCmsSnapshot> {
	const store = await getStore();
	const meta = store.metadata ?? {};

	function tryParse<T>(key: string): T | null {
		return parseStoreMetadataJson<T>(meta[key]);
	}

	const rawPageContent =
		normalizePageContentMap(tryParse<PageContentMap>(RETROHOUSE_PAGE_CONTENT_KEY) ?? {});

	if (pageContentMapNeedsHeroMigration(rawPageContent)) {
		const migrated = migrateKontaktHeroToONas(rawPageContent);
		await patchStoreMetadata(
			store.id,
			store.metadata,
			RETROHOUSE_PAGE_CONTENT_KEY,
			JSON.stringify(migrated),
		);
		return {
			siteSettings: tryParse<SiteSettings>(RETROHOUSE_SITE_SETTINGS_KEY),
			pageContentMap: migrated,
			globalContent: tryParse<GlobalContent>(RETROHOUSE_GLOBAL_CONTENT_KEY),
			pageSeoMap: tryParse<PageSeoMap>(RETROHOUSE_PAGE_SEO_KEY) ?? {},
		};
	}

	return {
		siteSettings: tryParse<SiteSettings>(RETROHOUSE_SITE_SETTINGS_KEY),
		pageContentMap: rawPageContent,
		globalContent: tryParse<GlobalContent>(RETROHOUSE_GLOBAL_CONTENT_KEY),
		pageSeoMap: tryParse<PageSeoMap>(RETROHOUSE_PAGE_SEO_KEY) ?? {},
	};
}
