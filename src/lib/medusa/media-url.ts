import { env } from "@/env";

/**
 * Normalizuje URL mediów z Medusa / R2. Względne ścieżki `/static/…` mapuje na
 * publiczny CDN (S3_FILE_URL), pełne URL-e backendu przepisuje na CDN.
 */

function medusaBackendOrigin(): string {
	return env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, "");
}

/** Publiczny origin R2 — ten sam co na backendzie Medusa (pub-*.r2.dev). */
export function mediaCdnOrigin(): string | undefined {
	const raw = env.S3_FILE_URL ?? env.NEXT_PUBLIC_S3_FILE_URL ?? env.NEXT_PUBLIC_CMS_MEDIA_BASE_URL;
	return raw?.replace(/\/$/, "");
}

function legacyProductCdnOrigin(): string | undefined {
	return env.NEXT_PUBLIC_MEDIA_CDN_URL?.replace(/\/$/, "");
}

function isMedusaMediaPath(pathWithLeadingSlash: string): boolean {
	return (
		pathWithLeadingSlash.startsWith("/static/") ||
		pathWithLeadingSlash.startsWith("/products/") ||
		pathWithLeadingSlash.startsWith("/uploads/")
	);
}

function rewriteRelativeMediaPathToCdn(pathWithLeadingSlash: string): string | undefined {
	const cdn = mediaCdnOrigin() ?? legacyProductCdnOrigin();
	if (!cdn || !isMedusaMediaPath(pathWithLeadingSlash)) return undefined;
	return `${cdn}${pathWithLeadingSlash}`;
}

function rewriteBackendMediaUrlToCdn(absoluteUrl: string): string {
	const cdn = mediaCdnOrigin() ?? legacyProductCdnOrigin();
	if (!cdn) return absoluteUrl;

	try {
		const parsed = new URL(absoluteUrl);
		const backend = new URL(medusaBackendOrigin());
		const sameHost =
			parsed.hostname === backend.hostname &&
			(parsed.port || "") === (backend.port || "");

		if (sameHost && isMedusaMediaPath(parsed.pathname)) {
			return `${cdn}${parsed.pathname}${parsed.search}`;
		}
	} catch {
		return absoluteUrl;
	}

	return absoluteUrl;
}

/** Medusa zapisuje w DB URL z localhost:9000 — podmieniamy na skonfigurowany backend / CDN. */
export function resolveMedusaMediaUrl(url: string | null | undefined): string | undefined {
	if (!url?.trim()) return undefined;

	const trimmed = url.trim();
	const backend = medusaBackendOrigin();

	if (trimmed.startsWith("/")) {
		return rewriteRelativeMediaPathToCdn(trimmed) ?? `${backend}${trimmed}`;
	}

	try {
		const parsed = new URL(trimmed);
		const isLocalMedusa =
			(parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
			(parsed.port === "9000" || parsed.port === "");

		if (isLocalMedusa) {
			const onBackend = `${backend}${parsed.pathname}${parsed.search}`;
			return rewriteBackendMediaUrlToCdn(onBackend);
		}

		return rewriteLegacyCmsAssetUrl(rewriteBackendMediaUrlToCdn(trimmed)) ?? rewriteBackendMediaUrlToCdn(trimmed);
	} catch {
		return trimmed;
	}
}

const CMS_ASSETS_HOST = "assets.sklep-retrohouse.pl";

/** Stare uploady wskazywały assets.sklep-retrohouse.pl — bucket CMS jest pod pub R2. */
function rewriteLegacyCmsAssetUrl(url: string): string | undefined {
	const r2Base = mediaCdnOrigin();
	if (!r2Base) return undefined;

	try {
		const parsed = new URL(url);
		if (parsed.hostname !== CMS_ASSETS_HOST) return undefined;
		if (
			parsed.pathname.startsWith("/cms-uploads/") ||
			parsed.pathname.startsWith("/cms/")
		) {
			return `${r2Base}${parsed.pathname}`;
		}
	} catch {
		return undefined;
	}

	return undefined;
}

export function resolveMedusaMediaUrls(urls: string[]): string[] {
	return urls
		.map((url) => resolveMedusaMediaUrl(url))
		.filter((url): url is string => Boolean(url));
}
