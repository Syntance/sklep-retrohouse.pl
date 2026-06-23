"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { AdminApiError, AdminUnauthorizedError } from "@/lib/admin/medusa-admin";
import { saveGlobalSeoSettings, savePageSeoMeta } from "@/lib/admin/seo-store";
import { siteSettingsSchema, seoMetaSchema } from "@/lib/content/parsers";
import { revalidateContentCache } from "@/lib/content/revalidate-content";
import type { ContentPageId, SeoMeta } from "@/lib/content/types";

export type SaveSeoState = {
	ok: boolean;
	error: string | null;
};

function handleError(error: unknown, fallback: string): SaveSeoState {
	if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
	if (error instanceof AdminApiError) return { ok: false, error: error.message };
	if (error instanceof Error) return { ok: false, error: error.message };
	return { ok: false, error: fallback };
}

const globalSeoPayloadSchema = z.object({
	title: z.string().min(1),
	description: z.string(),
	titleTemplate: z.string().optional(),
	defaultOgImageUrl: z.string().optional(),
	googleSiteVerification: z.string().optional(),
	seo: seoMetaSchema.optional(),
});

export async function saveGlobalSeoAction(
	payload: z.infer<typeof globalSeoPayloadSchema>,
): Promise<SaveSeoState> {
	const parsed = globalSeoPayloadSchema.safeParse(payload);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? "Błędne dane." };
	}

	try {
		const settings = siteSettingsSchema.parse({
			title: parsed.data.title,
			description: parsed.data.description,
			titleTemplate: parsed.data.titleTemplate,
			defaultOgImageUrl: parsed.data.defaultOgImageUrl || undefined,
			googleSiteVerification: parsed.data.googleSiteVerification || undefined,
			seo: parsed.data.seo,
		});
		await saveGlobalSeoSettings(settings);
	} catch (error) {
		return handleError(error, "Nie udało się zapisać SEO. Spróbuj ponownie.");
	}

	await revalidateContentCache(["/"]);
	return { ok: true, error: null };
}

export async function savePageSeoAction(
	pageId: ContentPageId,
	seo: SeoMeta,
	path: string,
): Promise<SaveSeoState> {
	const parsed = seoMetaSchema.safeParse(seo);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? "Błędne dane SEO." };
	}

	try {
		await savePageSeoMeta(pageId, parsed.data);
	} catch (error) {
		return handleError(error, "Nie udało się zapisać SEO podstrony.");
	}

	await revalidateContentCache([path]);
	return { ok: true, error: null };
}
