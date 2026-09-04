import "server-only";
import { resolveMedusaMediaUrls } from "@/lib/medusa/media-url";

/** Sprawdza, czy plik pod URL istnieje (HEAD). Martwe linki = upload sprzed migracji / utrata dysku Railway. */
export async function partitionReachableMediaUrls(urls: string[]): Promise<{
	valid: string[];
	staleCount: number;
}> {
	const resolved = resolveMedusaMediaUrls(urls);
	if (resolved.length === 0) return { valid: [], staleCount: 0 };

	const checks = await Promise.all(
		resolved.map(async (url) => {
			try {
				const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5_000) });
				return res.ok ? url : null;
			} catch {
				return null;
			}
		}),
	);

	const valid = checks.filter((url): url is string => url !== null);
	return { valid, staleCount: resolved.length - valid.length };
}
