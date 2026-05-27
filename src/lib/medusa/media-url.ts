import { env } from "@/env";

function medusaBackendOrigin(): string {
	return env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, "");
}

/** Medusa zapisuje w DB URL z localhost:9000 — podmieniamy na skonfigurowany backend. */
export function resolveMedusaMediaUrl(url: string | null | undefined): string | undefined {
	if (!url?.trim()) return undefined;

	const trimmed = url.trim();
	const backend = medusaBackendOrigin();

	if (trimmed.startsWith("/")) {
		return `${backend}${trimmed}`;
	}

	try {
		const parsed = new URL(trimmed);
		const isLocalMedusa =
			(parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
			(parsed.port === "9000" || parsed.port === "");

		if (isLocalMedusa) {
			return `${backend}${parsed.pathname}${parsed.search}`;
		}
	} catch {
		return trimmed;
	}

	return trimmed;
}

export function resolveMedusaMediaUrls(urls: string[]): string[] {
	return urls
		.map((url) => resolveMedusaMediaUrl(url))
		.filter((url): url is string => Boolean(url));
}
