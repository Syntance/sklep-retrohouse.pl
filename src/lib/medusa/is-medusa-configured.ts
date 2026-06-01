import { env } from "@/env";

/** Storefront może działać na mockach, gdy brak publishable key (tylko dev / CI ze SKIP). */
export function isMedusaConfigured(): boolean {
	return Boolean(env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY);
}
