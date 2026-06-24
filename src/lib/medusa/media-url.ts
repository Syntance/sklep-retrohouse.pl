import { env } from "@/env";
import { resolveCmsMediaPublicUrl } from "@/lib/content/cms-media-url";

function medusaBackendOrigin(): string {
	return env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, "");
}

function mediaCdnOrigin(): string | undefined {
	return env.NEXT_PUBLIC_MEDIA_CDN_URL?.replace(/\/$/, "");
}

function rewriteRelativeMediaPathToCdn(pathWithLeadingSlash: string): string | undefined {
	const cdn = mediaCdnOrigin();
	if (!cdn) return undefined;
	if (
		pathWithLeadingSlash.startsWith("/static/") ||
		pathWithLeadingSlash.startsWith("/products/")
	) {
		return `${cdn}${pathWithLeadingSlash}`;
	}
	return undefined;
}

function rewriteBackendMediaUrlToCdn(absoluteUrl: string): string {
	const cdn = mediaCdnOrigin();
	if (!cdn) return absoluteUrl;

	try {
		const parsed = new URL(absoluteUrl);
		const backend = new URL(medusaBackendOrigin());
		const sameHost =
			parsed.hostname === backend.hostname &&
			(parsed.port || "") === (backend.port || "");
		if (
			sameHost &&
			(parsed.pathname.startsWith("/static/") || parsed.pathname.startsWith("/products/"))
		) {
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

		return resolveCmsMediaPublicUrl(rewriteBackendMediaUrlToCdn(trimmed)) ?? rewriteBackendMediaUrlToCdn(trimmed);
	} catch {
		return trimmed;
	}
}

export function resolveMedusaMediaUrls(urls: string[]): string[] {
	return urls
		.map((url) => resolveMedusaMediaUrl(url))
		.filter((url): url is string => Boolean(url));
}
