"use server";

import { redirect } from "next/navigation";
import {
	mergeSiteSettings,
	savePageContent,
	savePageHeroBackground,
	savePageHeroImage,
} from "@/lib/admin/content-store";
import { recordAudit } from "@/lib/admin/audit-log";
import { AdminApiError, AdminUnauthorizedError } from "@/lib/admin/medusa-admin";
import { requireAdminSession } from "@/lib/admin/require-session";
import { CMS_PAGES } from "@/lib/content/metadata-keys";
import {
	cmsGlobalSettingsSchema,
	heroBackgroundPatchSchema,
	heroImagePatchSchema,
	pageContentSchema,
} from "@/lib/content/parsers";
import { revalidateContentCache, triggerCmsRedeploy } from "@/lib/content/revalidate-content";
import type { ContentPageId, PageContent } from "@/lib/content/types";

export type SaveContentState = {
	ok: boolean;
	error: string | null;
};

function handleError(error: unknown, fallback: string): SaveContentState {
	if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
	if (error instanceof AdminApiError) return { ok: false, error: error.message };
	if (error instanceof Error) return { ok: false, error: error.message };
	return { ok: false, error: fallback };
}

export async function savePageContentAction(
	pageId: ContentPageId,
	path: string,
	content: PageContent,
): Promise<SaveContentState> {
	const parsed = pageContentSchema.safeParse(content);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? "Błędne dane CMS." };
	}

	try {
		await requireAdminSession();
		await savePageContent(pageId, parsed.data);
	} catch (error) {
		return handleError(error, "Nie udało się zapisać treści podstrony.");
	}

	await recordAudit("cms.page.save", { target: pageId });
	await revalidateContentCache([path]);
	return { ok: true, error: null };
}

export async function savePageHeroImageAction(
	pageId: ContentPageId,
	path: string,
	image: { productImageUrl: string; productImageAlt?: string },
): Promise<SaveContentState> {
	const parsed = heroImagePatchSchema.safeParse(image);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? "Nieprawidłowy adres obrazu." };
	}

	try {
		await requireAdminSession();
		await savePageHeroImage(pageId, parsed.data);
	} catch (error) {
		return handleError(error, "Nie udało się zapisać zdjęcia hero.");
	}

	await recordAudit("cms.hero-image.save", { target: pageId });
	await revalidateContentCache([path]);
	return { ok: true, error: null };
}

export async function savePageHeroBackgroundAction(
	pageId: ContentPageId,
	path: string,
	image: { backgroundImageUrl: string; backgroundImageAlt?: string },
): Promise<SaveContentState> {
	const parsed = heroBackgroundPatchSchema.safeParse(image);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? "Nieprawidłowy adres obrazu." };
	}

	try {
		await requireAdminSession();
		await savePageHeroBackground(pageId, parsed.data);
	} catch (error) {
		return handleError(error, "Nie udało się zapisać tła hero.");
	}

	await recordAudit("cms.hero-background.save", { target: pageId });
	await revalidateContentCache([path]);
	return { ok: true, error: null };
}

export async function saveCmsGlobalSettingsAction(
	settings: Pick<
		import("@/lib/content/types").SiteSettings,
		"announcementBar" | "popupBanner" | "footerText" | "socialLinks"
	>,
): Promise<SaveContentState> {
	const parsed = cmsGlobalSettingsSchema.safeParse(settings);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? "Błędne ustawienia." };
	}

	if (parsed.data.announcementBar?.enabled && !parsed.data.announcementBar.text?.trim()) {
		return { ok: false, error: "Pasek informacyjny: wpisz tekst lub odznacz „Włączony”." };
	}

	try {
		await requireAdminSession();
		await mergeSiteSettings(parsed.data);
	} catch (error) {
		return handleError(error, "Nie udało się zapisać treści globalnych.");
	}

	await recordAudit("cms.global-settings.save");
	await revalidateContentCache(["/", ...CMS_PAGES.map((p) => p.path)]);
	return { ok: true, error: null };
}

export type RedeployContentState = {
	ok: boolean;
	error: string | null;
	queued: boolean;
};

export async function triggerCmsRedeployAction(): Promise<RedeployContentState> {
	// Server Action jest publicznym endpointem — deploy hook Vercel odpala się
	// POZA adminFetch, więc sesję trzeba zweryfikować jawnie.
	try {
		await requireAdminSession();
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		return { ok: false, error: "Brak autoryzacji.", queued: false };
	}

	const hookConfigured = Boolean(process.env.VERCEL_DEPLOY_HOOK_URL?.trim());
	await recordAudit("cms.redeploy");
	const queued = await triggerCmsRedeploy("CMS manual redeploy (panel)");

	if (!queued) {
		return {
			ok: false,
			error: hookConfigured
				? "Nie udało się uruchomić redeploy na Vercel. Spróbuj ponownie za chwilę."
				: "Deploy hook nie jest skonfigurowany (VERCEL_DEPLOY_HOOK_URL).",
			queued: false,
		};
	}

	return { ok: true, error: null, queued: true };
}
