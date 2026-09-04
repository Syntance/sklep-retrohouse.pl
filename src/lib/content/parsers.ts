import { z } from "zod";
import { parseStoreMetadataJson } from "./metadata-json";
import type { GlobalContent, PageContentMap, PageSeoMap, SiteSettings } from "./types";

/* ---------- atoms ---------- */

export const seoMetaSchema = z.object({
	metaTitle: z.string().max(70).optional(),
	metaDescription: z.string().max(160).optional(),
	ogTitle: z.string().max(70).optional(),
	ogDescription: z.string().max(160).optional(),
	ogImageUrl: z.string().max(500).optional(),
	canonicalUrl: z.string().max(500).optional(),
	noIndex: z.boolean().optional(),
	noFollow: z.boolean().optional(),
});

const announcementBarSchema = z.object({
	enabled: z.boolean(),
	text: z.string().max(200),
	link: z.string().max(500).optional(),
});

export const popupBannerSchema = z.object({
	enabled: z.boolean(),
	title: z.string().max(120),
	body: z.string().max(600).optional(),
	imageUrl: z.string().max(500).optional(),
	ctaLabel: z.string().max(60).optional(),
	ctaHref: z.string().max(500).optional(),
	oncePerSession: z.boolean(),
	delayMs: z.number().int().min(0).max(60_000),
});

const optionalSocialLink = z.preprocess(
	(v) => (typeof v === "string" ? v.trim() : v),
	z
		.string()
		.max(200)
		.optional()
		.transform((v) => v || undefined),
);

const socialLinksSchema = z
	.object({
		instagram: optionalSocialLink,
		facebook: optionalSocialLink,
		whatsapp: optionalSocialLink,
	})
	.transform((links) => {
		const normalized = {
			...(links.instagram ? { instagram: links.instagram } : {}),
			...(links.facebook ? { facebook: links.facebook } : {}),
			...(links.whatsapp ? { whatsapp: links.whatsapp } : {}),
		};
		return Object.keys(normalized).length > 0 ? normalized : undefined;
	});

/* ---------- site settings ---------- */

export const siteSettingsSchema = z.object({
	title: z.string().min(1).max(100),
	description: z.string().min(1).max(500),
	announcementBar: announcementBarSchema.optional(),
	popupBanner: popupBannerSchema.optional(),
	socialLinks: socialLinksSchema.optional(),
	footerText: z.string().max(500).optional(),
	titleTemplate: z.string().max(100).optional(),
	defaultOgImageUrl: z.string().max(500).optional(),
	googleSiteVerification: z.string().max(200).optional(),
	seo: seoMetaSchema.optional(),
});

/* ---------- page content ---------- */

const heroImageUrlSchema = z.preprocess(
	(v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
	z.string().url().optional(),
);

const heroContentSchema = z.object({
	headline: z.string().min(1).max(200),
	subLead: z.string().max(100).optional(),
	description: z.string().min(1).max(500),
	ctaLabel: z.string().min(1).max(60),
	ctaHref: z.string().min(1).max(500),
	ctaSecondaryLabel: z.string().max(60).optional(),
	ctaSecondaryHref: z.string().max(500).optional(),
	productImageUrl: heroImageUrlSchema,
	productImageAlt: z.string().max(200).optional(),
	productImageWidth: z.number().int().positive().optional(),
	productImageHeight: z.number().int().positive().optional(),
	backgroundImageUrl: heroImageUrlSchema,
	backgroundImageAlt: z.string().max(200).optional(),
});

/** Odczyt z Medusa — hero może mieć tylko URL obrazu (bez copy). */
const heroContentReadSchema = z.object({
	headline: z.string().max(200).optional(),
	subLead: z.string().max(100).optional(),
	description: z.string().max(500).optional(),
	ctaLabel: z.string().max(60).optional(),
	ctaHref: z.string().max(500).optional(),
	ctaSecondaryLabel: z.string().max(60).optional(),
	ctaSecondaryHref: z.string().max(500).optional(),
	productImageUrl: heroImageUrlSchema,
	productImageAlt: z.string().max(200).optional(),
	productImageWidth: z.number().int().positive().optional(),
	productImageHeight: z.number().int().positive().optional(),
	backgroundImageUrl: heroImageUrlSchema,
	backgroundImageAlt: z.string().max(200).optional(),
});

export const heroImagePatchSchema = z.object({
	productImageUrl: z.string().url(),
	productImageAlt: z.string().max(200).optional(),
});

export const heroBackgroundPatchSchema = z.object({
	backgroundImageUrl: z.string().url(),
	backgroundImageAlt: z.string().max(200).optional(),
});

const faqItemSchema = z.object({
	id: z.string().min(1),
	question: z.string().min(1).max(300),
	answer: z.string().min(1).max(2000),
	order: z.number().int().nonnegative(),
});

export const pageContentSchema = z.object({
	hero: heroContentSchema.optional(),
	faq: z.array(faqItemSchema).optional(),
});

const pageContentReadSchema = z.object({
	hero: heroContentReadSchema.optional(),
	faq: z.array(faqItemSchema).optional(),
});

const globalContentSchema = z.object({
	announcementBar: announcementBarSchema.optional(),
});

const pageSeoMapSchema = z.record(z.string(), seoMetaSchema);
const pageContentMapReadSchema = z.record(z.string(), pageContentReadSchema);

export const cmsGlobalSettingsSchema = z.object({
	announcementBar: announcementBarSchema.optional(),
	popupBanner: popupBannerSchema.optional(),
	socialLinks: socialLinksSchema.optional(),
	footerText: z.string().max(500).optional(),
});

/* ---------- helpers ---------- */

function parseJsonBlob<T>(raw: unknown, schema: z.ZodType<T>): T | null {
	const parsed = parseStoreMetadataJson<unknown>(raw);
	if (!parsed) return null;
	const result = schema.safeParse(parsed);
	return result.success ? result.data : null;
}

export function parseSiteSettings(raw: unknown): SiteSettings | null {
	return parseJsonBlob(raw, siteSettingsSchema);
}

export function parsePageContentMap(raw: unknown): PageContentMap | null {
	return parseJsonBlob(raw, pageContentMapReadSchema);
}

export function parsePageSeoMap(raw: unknown): PageSeoMap | null {
	return parseJsonBlob(raw, pageSeoMapSchema);
}

export function parseGlobalContent(raw: unknown): GlobalContent | null {
	return parseJsonBlob(raw, globalContentSchema);
}
