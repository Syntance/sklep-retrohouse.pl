import { env } from "@/env";

const CMS_ASSETS_HOST = "assets.sklep-retrohouse.pl";

/** Publiczny URL plików CMS w R2 (pub-*.r2.dev — ten sam bucket co upload). */
export function cmsR2PublicBaseUrl(): string | undefined {
	return (
		env.S3_FILE_URL ??
		env.NEXT_PUBLIC_CMS_MEDIA_BASE_URL ??
		env.S3_PUBLIC_URL ??
		env.NEXT_PUBLIC_MEDIA_CDN_URL
	)?.replace(/\/$/, "");
}

/**
 * CMS upload idzie do bucketu lumine-media (pub R2).
 * assets.sklep-retrohouse.pl wskazuje na inny bucket → 404 dla /cms/*.
 */
export function resolveCmsMediaPublicUrl(url: string | null | undefined): string | undefined {
	if (!url?.trim()) return undefined;

	const trimmed = url.trim();
	const r2Base = cmsR2PublicBaseUrl();
	if (!r2Base) return trimmed;

	try {
		const parsed = new URL(trimmed);
		if (parsed.hostname === CMS_ASSETS_HOST && parsed.pathname.startsWith("/cms/")) {
			return `${r2Base}${parsed.pathname}`;
		}
	} catch {
		return trimmed;
	}

	return trimmed;
}
