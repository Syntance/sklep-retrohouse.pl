import { createClient, type SanityClient } from "@sanity/client";
import { env } from "@/env";

/**
 * Klient publiczny (published). Token opcjonalny — na preview/draft w kolejnym etapie.
 */
export function getSanityReadClient(): SanityClient | null {
	const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
	if (!projectId) return null;

	return createClient({
		projectId,
		dataset: env.NEXT_PUBLIC_SANITY_DATASET,
		apiVersion: "2025-05-01",
		useCdn: true,
		perspective: "published",
		...(env.SANITY_API_READ_TOKEN ? { token: env.SANITY_API_READ_TOKEN } : {}),
	});
}
