"use server";

import { z } from "zod";

/**
 * Live reminder — Server Action.
 *
 * MVP: walidacja Zodem + log + return success. Resend (auto-reply
 * z .ics w załączniku) etap 2, gdy będzie RESEND_API_KEY — wtedy
 * tu lądują wywołania `resend.emails.send(...)`.
 *
 * Reguła stabilności (60-quality): external call MUSI mieć timeout,
 * więc lepiej zostawić stub niż dodać "naked" fetch bez `AbortSignal.timeout`.
 *
 * CSRF: Server Action nadaje encrypted action ID + origin check
 * automatycznie (Next 16). Nie wyłączamy.
 */

const LiveReminderSchema = z.object({
	email: z.string().email({ message: "Podaj prawidłowy e-mail." }),
});

export type LiveReminderState =
	| { status: "idle" }
	| { status: "success" }
	| { status: "error"; message: string };

export async function submitLiveReminder(
	_prev: LiveReminderState,
	formData: FormData,
): Promise<LiveReminderState> {
	const parsed = LiveReminderSchema.safeParse({
		email: formData.get("email"),
	});

	if (!parsed.success) {
		return {
			status: "error",
			message: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane.",
		};
	}

	// TODO(retrohouse): Resend integration etap 2 — wymaga RESEND_API_KEY +
	// `AbortSignal.timeout(5_000)` zgodnie z 60-quality (timeouty na external).
	// Na dziś rejestrujemy tylko sukces walidacji; PostHog event leci po stronie klienta.
	return { status: "success" };
}
