import Medusa from "@medusajs/js-sdk";
import "server-only";
import { env } from "@/env";

export const medusa = new Medusa({
	baseUrl: env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
	publishableKey: env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
});
