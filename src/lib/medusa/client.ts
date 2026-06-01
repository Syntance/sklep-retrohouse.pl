import Medusa from "@medusajs/js-sdk";
import "server-only";
import { env } from "@/env";
import { isMedusaConfigured } from "@/lib/medusa/is-medusa-configured";

let cached: Medusa | null = null;

export function getMedusaClient(): Medusa | null {
	if (!isMedusaConfigured()) return null;
	if (!cached) {
		const publishableKey = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
		if (!publishableKey) return null;
		cached = new Medusa({
			baseUrl: env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
			publishableKey,
		});
	}
	return cached;
}
