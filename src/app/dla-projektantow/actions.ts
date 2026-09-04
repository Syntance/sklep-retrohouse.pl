"use server";

import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { B2BBriefSchema } from "@/lib/validation/b2b-brief";

export type B2BBriefState =
	| { status: "idle" }
	| { status: "success" }
	| { status: "error"; message: string; fieldErrors?: Record<string, string> };

/**
 * submitBrief — Server Action B2B.
 *
 * Krok 1: rate-limit po IP (5 prób / 60s — mutation, ostre).
 * Krok 2: walidacja Zodem (B2BBriefSchema).
 * Krok 3: stub — w etap 2 doda się Resend (auto-reply + Slack hook).
 *
 * Reguła stabilności (60-quality § timeouty): zero `fetch()` external
 * tutaj, dopiero gdy podepniemy Resend z `AbortSignal.timeout(5_000)`.
 *
 * CSRF: Server Actions automatycznie chronione encrypted action ID
 * + origin check (Next 16). Nie wyłączamy.
 *
 * PostHog event b2b_brief_submitted leci po stronie klienta (action
 * zwraca status: success → komponent emit'uje event; serwerowy
 * track wymaga osobnego SDK i nie chcemy zaciemniać eventów PII).
 */
export async function submitBrief(
	_prev: B2BBriefState,
	formData: FormData,
): Promise<B2BBriefState> {
	const reqHeaders = await headers();
	const ip =
		reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		reqHeaders.get("x-real-ip") ??
		"unknown";
	const limit = rateLimit(`b2b:${ip}`, 5, 60_000);
	if (!limit.ok) {
		return {
			status: "error",
			message: `Za dużo prób. Spróbuj za ${limit.retryAfterSec} s.`,
		};
	}

	const raw = Object.fromEntries(formData.entries());
	const parsed = B2BBriefSchema.safeParse(raw);

	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {};
		for (const issue of parsed.error.issues) {
			const path = issue.path[0];
			if (typeof path === "string" && !fieldErrors[path]) fieldErrors[path] = issue.message;
		}
		return {
			status: "error",
			message: "Sprawdź pola formularza i spróbuj ponownie.",
			fieldErrors,
		};
	}

	// TODO(retrohouse): Resend + Slack webhook etap 2 (RESEND_API_KEY).
	// Wymóg 60-quality: external call z AbortSignal.timeout(5_000).
	// Dziś jedynie walidacja + telemetria po stronie klienta.

	return { status: "success" };
}
