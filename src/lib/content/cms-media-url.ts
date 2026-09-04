import { resolveMedusaMediaUrl } from "@/lib/medusa/media-url";

/** Rewrite starych URLi CMS → pub R2 (via resolveMedusaMediaUrl). */
export function resolveCmsMediaPublicUrl(url: string | null | undefined): string | undefined {
	return resolveMedusaMediaUrl(url);
}
