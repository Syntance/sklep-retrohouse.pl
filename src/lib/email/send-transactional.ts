import "server-only";

import { Resend } from "resend";
import { env } from "@/env";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/email/constants";

const RESEND_TIMEOUT_MS = 10_000;

type SendEmailInput = {
	to: string;
	subject: string;
	text: string;
	html: string;
};

type SendEmailResult = { ok: true; skipped?: boolean } | { ok: false; message: string };

export async function sendTransactionalEmail(input: SendEmailInput): Promise<SendEmailResult> {
	const apiKey = env.RESEND_API_KEY;
	if (!apiKey) return { ok: true, skipped: true };
	if (!input.to.trim()) return { ok: true, skipped: true };

	const from = env.RESEND_FROM_EMAIL ? `RetroHouse <${env.RESEND_FROM_EMAIL}>` : EMAIL_FROM;

	const resend = new Resend(apiKey);
	const sendPromise = resend.emails.send({
		from,
		to: [input.to.trim()],
		replyTo: EMAIL_REPLY_TO,
		subject: input.subject,
		text: input.text,
		html: input.html,
	});

	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = setTimeout(() => reject(new Error("Resend timeout")), RESEND_TIMEOUT_MS);
	});

	try {
		const { data, error } = await Promise.race([sendPromise, timeoutPromise]);
		if (error || !data?.id) {
			return { ok: false, message: "Nie udało się wysłać wiadomości e-mail." };
		}
		return { ok: true };
	} catch {
		return { ok: false, message: "Przekroczono czas oczekiwania na wysyłkę e-maila." };
	} finally {
		if (timeoutId !== undefined) clearTimeout(timeoutId);
	}
}
