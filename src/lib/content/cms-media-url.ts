import { mediaCdnOrigin, resolveMedusaMediaUrl } from "@/lib/medusa/media-url";

/** Publiczny URL plików CMS w R2 (pub-*.r2.dev). */
export function cmsR2PublicBaseUrl(): string | undefined {
	return mediaCdnOrigin();
}

/** Rewrite starych URLi CMS → pub R2 (via resolveMedusaMediaUrl). */
export function resolveCmsMediaPublicUrl(url: string | null | undefined): string | undefined {
	return resolveMedusaMediaUrl(url);
}
