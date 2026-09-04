import { resolveMedusaMediaUrl } from "@/lib/medusa/media-url";

const STOREFRONT_PUBLIC_PREFIXES = ["/images/", "/icons/"] as const;

function isStorefrontPublicAssetPath(url: string): boolean {
	if (url.startsWith("/")) {
		return STOREFRONT_PUBLIC_PREFIXES.some((prefix) => url.startsWith(prefix));
	}
	try {
		const pathname = new URL(url).pathname;
		return STOREFRONT_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
	} catch {
		return false;
	}
}

/**
 * Podgląd w panelu Magazyn — pełny URL (R2/CDN), bez media gate storefrontu.
 */
export function resolveCmsAdminPreviewUrl(url: string | null | undefined): string | undefined {
	if (!url?.trim()) return undefined;
	const trimmed = url.trim();

	if (isStorefrontPublicAssetPath(trimmed)) {
		const pathOnly = trimmed.startsWith("/") ? trimmed : new URL(trimmed).pathname;
		return pathOnly.split("?")[0] || pathOnly;
	}

	return resolveMedusaMediaUrl(trimmed) ?? trimmed;
}
