import "server-only";

import { readAdminCmsSnapshot, mergeSiteSettings, savePageSeo } from "./content-store";
import { DEFAULT_SITE_SETTINGS } from "@/lib/content/defaults";
import type { ContentPageId, PageSeoMap, SeoMeta, SiteSettings } from "@/lib/content/types";

export type SeoSettingsBundle = {
	siteSettings: SiteSettings;
	pageSeo: PageSeoMap;
};

const GLOBAL_SEO_FIELDS = [
	"title",
	"description",
	"titleTemplate",
	"defaultOgImageUrl",
	"googleSiteVerification",
	"seo",
] as const satisfies ReadonlyArray<keyof SiteSettings>;

export async function getSeoSettingsBundle(): Promise<SeoSettingsBundle> {
	const snapshot = await readAdminCmsSnapshot();
	return {
		siteSettings: snapshot.siteSettings ?? DEFAULT_SITE_SETTINGS,
		pageSeo: snapshot.pageSeoMap,
	};
}

function normalizeSeoMeta(seo: SeoMeta | undefined): SeoMeta | undefined {
	if (!seo) return undefined;
	const next: SeoMeta = { ...seo };
	if (next.ogImageUrl === "") delete next.ogImageUrl;
	if (next.canonicalUrl === "") delete next.canonicalUrl;
	return Object.keys(next).length > 0 ? next : undefined;
}

export async function saveGlobalSeoSettings(settings: SiteSettings): Promise<void> {
	const snapshot = await readAdminCmsSnapshot();
	const current = snapshot.siteSettings ?? DEFAULT_SITE_SETTINGS;

	const merged: SiteSettings = { ...current };
	for (const field of GLOBAL_SEO_FIELDS) {
		if (field in settings) {
			Object.assign(merged, { [field]: settings[field] });
		}
	}
	if (merged.defaultOgImageUrl === "") delete merged.defaultOgImageUrl;
	if (merged.googleSiteVerification === "") delete merged.googleSiteVerification;
	merged.seo = normalizeSeoMeta(merged.seo);

	await mergeSiteSettings(merged);
}

export async function savePageSeoMeta(pageId: ContentPageId, seo: SeoMeta): Promise<void> {
	await savePageSeo(pageId, normalizeSeoMeta(seo) ?? {});
}
