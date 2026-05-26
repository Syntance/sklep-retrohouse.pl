import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Centralna walidacja zmiennych środowiskowych.
 * Build fails gdy required env brakuje — zgodnie z 55-security.mdc.
 *
 * W kodzie: `import { env } from "@/env"`. NIE używaj `process.env.X` bezpośrednio.
 */
export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

		CLOUDINARY_API_KEY: z.string().optional(),
		CLOUDINARY_API_SECRET: z.string().optional(),

		SANITY_API_READ_TOKEN: z.string().optional(),

		SENTRY_AUTH_TOKEN: z.string().optional(),
		SENTRY_ORG: z.string().optional(),
		SENTRY_PROJECT: z.string().optional(),

		/** Transactional — formularz /kontakt (Resend). Bez klucza akcja kończy się sukcesem bez wysyłki (preview / CI). */
		RESEND_API_KEY: z.string().optional(),
		/** Zweryfikowany nadawca w Resend. Domyślnie w kodzie: onboarding@resend.dev (tylko sandbox). */
		RESEND_FROM_EMAIL: z.string().email().optional(),
		/** Skrzynka zespołu (odbiorca zgłoszeń z formularza kontaktowego). */
		RESEND_CONTACT_TO: z.string().email().optional(),
	},
	client: {
		/** URL backendu Medusa (Railway). Używany przez Medusa JS SDK. */
		NEXT_PUBLIC_MEDUSA_BACKEND_URL: z.string().url().default("http://localhost:9000"),

		NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),

		NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().optional(),
		NEXT_PUBLIC_SANITY_DATASET: z.string().default("production"),

		NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
		NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default("https://eu.posthog.com"),

		NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

		NEXT_PUBLIC_SITE_URL: z.string().url().default("https://sklep.retrohouse.pl"),

		/**
		 * Live commerce — banner na homepage. Sanity nie podpięte (etap 2),
		 * więc tymczasowo flaga przez env. Migracja: ADR-0006.
		 */
		NEXT_PUBLIC_LIVE_SCHEDULED: z
			.union([z.literal("true"), z.literal("false")])
			.default("false")
			.transform((v) => v === "true"),
		NEXT_PUBLIC_LIVE_DATE: z.string().datetime({ offset: true }).optional(),
		NEXT_PUBLIC_LIVE_DROP_TITLE: z.string().optional(),
		NEXT_PUBLIC_LIVE_DROP_COUNT: z.coerce.number().int().positive().optional(),
	},
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,

		CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
		CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
		NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,

		NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,

		SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
		NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
		NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,

		NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
		NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,

		NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
		SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
		SENTRY_ORG: process.env.SENTRY_ORG,
		SENTRY_PROJECT: process.env.SENTRY_PROJECT,

		RESEND_API_KEY: process.env.RESEND_API_KEY,
		RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
		RESEND_CONTACT_TO: process.env.RESEND_CONTACT_TO,

		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,

		NEXT_PUBLIC_LIVE_SCHEDULED: process.env.NEXT_PUBLIC_LIVE_SCHEDULED,
		NEXT_PUBLIC_LIVE_DATE: process.env.NEXT_PUBLIC_LIVE_DATE,
		NEXT_PUBLIC_LIVE_DROP_TITLE: process.env.NEXT_PUBLIC_LIVE_DROP_TITLE,
		NEXT_PUBLIC_LIVE_DROP_COUNT: process.env.NEXT_PUBLIC_LIVE_DROP_COUNT,
	},
	emptyStringAsUndefined: true,
	skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
