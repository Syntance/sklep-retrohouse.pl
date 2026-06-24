import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isStrictEnv =
	process.env.NODE_ENV === "production" && process.env.SKIP_ENV_VALIDATION !== "true";

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
		/** Zweryfikowany nadawca w Resend (domyślnie w kodzie: kontakt@sklep-retrohouse.pl). */
		RESEND_FROM_EMAIL: z.string().email().optional(),
		/** Skrzynka zespołu (odbiorca zgłoszeń z formularza kontaktowego). */
		RESEND_CONTACT_TO: z.string().email().optional(),

		/**
		 * Opcjonalne — odczyt konfiguracji katalogu (epoki) w SSR sklepu bez sesji admina.
		 * Te same dane logowania co do panelu /magazyn.
		 */
		MEDUSA_ADMIN_EMAIL: z.preprocess(
			(val) => (typeof val === "string" ? val.trim() : val),
			z.string().email().optional(),
		),
		MEDUSA_ADMIN_PASSWORD: z.preprocess(
			(val) => (typeof val === "string" ? val.trim() : val),
			z.string().min(1).optional(),
		),

		/** Bezpośredni upload CMS do Cloudflare R2 (omija Medusa /admin/uploads). Te same wartości co na backendzie Medusa. */
		S3_ENDPOINT: z.preprocess(
			(val) => (typeof val === "string" ? val.trim() : val),
			z.string().url().optional(),
		),
		S3_BUCKET: z.preprocess(
			(val) => (typeof val === "string" ? val.trim() : val),
			z.string().min(1).optional(),
		),
		S3_ACCESS_KEY_ID: z.preprocess(
			(val) => (typeof val === "string" ? val.trim() : val),
			z.string().min(1).optional(),
		),
		S3_SECRET_ACCESS_KEY: z.preprocess(
			(val) => (typeof val === "string" ? val.trim() : val),
			z.string().min(1).optional(),
		),
		S3_PUBLIC_URL: z.preprocess(
			(val) => (typeof val === "string" ? val.trim() : val),
			z.string().url().optional(),
		),
		/** Publiczny URL bucketu R2 (pub-*.r2.dev) — działa dla uploadów CMS. */
		S3_FILE_URL: z.preprocess(
			(val) => (typeof val === "string" ? val.trim() : val),
			z.string().url().optional(),
		),
		S3_REGION: z.preprocess(
			(val) => (typeof val === "string" ? val.trim() : val),
			z.string().min(1).optional(),
		),
	},
	client: {
		/** URL backendu Medusa (Railway). Używany przez Medusa JS SDK. */
		NEXT_PUBLIC_MEDUSA_BACKEND_URL: z
			.string()
			.url()
			.default("https://medusa-backend-production-9270.up.railway.app"),
		/** Publishable API key ze sklepu Medusa (Settings → Publishable API Keys). */
		NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: isStrictEnv
			? z.preprocess(
					(val) => (typeof val === "string" ? val.trim() : val),
					z.string().min(1),
				)
			: z.preprocess(
					(val) => (typeof val === "string" ? val.trim() : val),
					z.string().min(1).optional(),
				),

		NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),

		/**
		 * Publiczna domena CDN dla mediów Medusa (Cloudflare R2 / S3).
		 * Po migracji storage backendu na R2 ustaw np. https://assets.sklep-retrohouse.pl —
		 * trafia do `images.remotePatterns` w next.config.ts. Patrz docs/runbook/railway-disaster-recovery.md.
		 */
		NEXT_PUBLIC_MEDIA_CDN_URL: z.string().url().optional(),

		/** Publiczny URL R2 dla uploadów CMS (pub-*.r2.dev). Ustaw taki sam jak S3_FILE_URL. */
		NEXT_PUBLIC_CMS_MEDIA_BASE_URL: z.string().url().optional(),

		NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().optional(),
		NEXT_PUBLIC_SANITY_DATASET: z.string().default("production"),

		NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
		NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default("https://eu.posthog.com"),

		/** Meta Pixel — ładowany wyłącznie po zgodzie marketingowej (art. 173 PT). */
		NEXT_PUBLIC_META_PIXEL_ID: z
			.string()
			.regex(/^\d+$/)
			.optional(),

		NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

		NEXT_PUBLIC_SITE_URL: z.string().url().default("https://sklep-retrohouse.pl"),

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
		NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,

		NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
		NEXT_PUBLIC_MEDIA_CDN_URL: process.env.NEXT_PUBLIC_MEDIA_CDN_URL,
		NEXT_PUBLIC_CMS_MEDIA_BASE_URL: process.env.NEXT_PUBLIC_CMS_MEDIA_BASE_URL,

		SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
		NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
		NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,

		NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
		NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,

		NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
		SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
		SENTRY_ORG: process.env.SENTRY_ORG,
		SENTRY_PROJECT: process.env.SENTRY_PROJECT,

		RESEND_API_KEY: process.env.RESEND_API_KEY,
		RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
		RESEND_CONTACT_TO: process.env.RESEND_CONTACT_TO,

		MEDUSA_ADMIN_EMAIL: process.env.MEDUSA_ADMIN_EMAIL,
		MEDUSA_ADMIN_PASSWORD: process.env.MEDUSA_ADMIN_PASSWORD,

		S3_ENDPOINT: process.env.S3_ENDPOINT,
		S3_BUCKET: process.env.S3_BUCKET,
		S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
		S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
		S3_PUBLIC_URL: process.env.S3_PUBLIC_URL,
		S3_FILE_URL: process.env.S3_FILE_URL,
		S3_REGION: process.env.S3_REGION,

		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,

		NEXT_PUBLIC_LIVE_SCHEDULED: process.env.NEXT_PUBLIC_LIVE_SCHEDULED,
		NEXT_PUBLIC_LIVE_DATE: process.env.NEXT_PUBLIC_LIVE_DATE,
		NEXT_PUBLIC_LIVE_DROP_TITLE: process.env.NEXT_PUBLIC_LIVE_DROP_TITLE,
		NEXT_PUBLIC_LIVE_DROP_COUNT: process.env.NEXT_PUBLIC_LIVE_DROP_COUNT,
	},
	emptyStringAsUndefined: true,
	skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
