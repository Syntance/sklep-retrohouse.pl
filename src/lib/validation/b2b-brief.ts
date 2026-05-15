import { z } from "zod";

/**
 * B2B brief schema — Zod source of truth dla client + server.
 *
 * Reguły:
 *  - NIP: 10 cyfr (regex `/^\d{10}$/`). Walidacja sumy kontrolnej —
 *    nie blokujemy submitu (test polski jest dość ścisły, mock NIP
 *    do tetsów wymagałby narzutu — w prod backendowym kroku weryfikujemy).
 *  - brief: 50 znaków minimum (poprzeczka, żeby zwracał się sensowny
 *    feedback do studia).
 *  - budget / timeline: enum (matchuje analytics events: B2BBudgetBucket,
 *    B2BTimeline w `src/lib/analytics/events.ts`).
 */

export const B2B_BUDGETS = ["do_2k", "2_5k", "5_15k", "15k_plus"] as const;
export const B2B_TIMELINES = ["lt_2w", "2_4w", "1_3m", "elastycznie"] as const;

export const B2BBriefSchema = z.object({
	name: z.string().trim().min(2, "Podaj imię i nazwisko."),
	studio: z.string().trim().min(2, "Podaj nazwę studia."),
	email: z.string().email("Podaj prawidłowy e-mail."),
	phone: z.string().trim().optional().or(z.literal("")),
	nip: z
		.string()
		.trim()
		.optional()
		.or(z.literal(""))
		.transform((v) => (v && v.length > 0 ? v.replace(/\s|-/g, "") : undefined))
		.pipe(
			z
				.string()
				.regex(/^\d{10}$/, "NIP to 10 cyfr — bez kresek i spacji.")
				.optional(),
		),
	brief: z
		.string()
		.trim()
		.min(50, "Brief musi mieć minimum 50 znaków — jakieś szczegóły, link do mood boardu."),
	budget: z.enum(B2B_BUDGETS),
	timeline: z.enum(B2B_TIMELINES),
	hasMoodboard: z
		.union([z.literal("on"), z.literal("off"), z.boolean()])
		.optional()
		.transform((v) => v === true || v === "on"),
	newsletter: z
		.union([z.literal("on"), z.literal("off"), z.boolean()])
		.optional()
		.transform((v) => v === true || v === "on"),
});

export type B2BBriefInput = z.input<typeof B2BBriefSchema>;
export type B2BBriefData = z.output<typeof B2BBriefSchema>;
