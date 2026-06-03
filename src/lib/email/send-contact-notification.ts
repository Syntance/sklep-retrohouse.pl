import "server-only";

import { Resend } from "resend";
import { env } from "@/env";
import { EMAIL_CONTACT, EMAIL_FROM } from "@/lib/email/constants";
import { formatContactTopicLabel, type ContactData } from "@/lib/validation/contact";

const RESEND_TIMEOUT_MS = 5_000;

/** Domyślny odbiorca gdy brak RESEND_CONTACT_TO. */
const DEFAULT_CONTACT_INBOX = EMAIL_CONTACT;

export type SendContactResult = { ok: true; skipped?: boolean } | { ok: false; message: string };

/**
 * Wysyła treść formularza /kontakt na skrzynkę zespołu przez Resend.
 * Bez RESEND_API_KEY zwraca sukces (skipped) — preview i CI bez sekretów.
 */
export type SendContactNotificationOptions = {
	recipientEmail: string;
	caseNumber: string;
	formName?: string;
};

export async function sendContactNotification(
	data: ContactData,
	options: SendContactNotificationOptions,
): Promise<SendContactResult> {
	const apiKey = env.RESEND_API_KEY;
	if (!apiKey) {
		return { ok: true, skipped: true };
	}

	const from = env.RESEND_FROM_EMAIL ? `RetroHouse <${env.RESEND_FROM_EMAIL}>` : EMAIL_FROM;
	const to =
		(options.recipientEmail.trim() || env.RESEND_CONTACT_TO) ?? DEFAULT_CONTACT_INBOX;

	const topicLabel = formatContactTopicLabel(data);
	const formLine = options.formName ? `Formularz: ${options.formName}\n` : "";
	const text =
		`Numer sprawy: ${options.caseNumber}\n` +
		formLine +
		`Temat: ${topicLabel}\n` +
		`Od: ${data.name} <${data.email}>\n\n` +
		`${data.message}\n`;

	const resend = new Resend(apiKey);

	const sendPromise = resend.emails.send({
		from,
		to: [to],
		replyTo: data.email,
		subject: `[RetroHouse · Kontakt] ${options.caseNumber} — ${topicLabel} — ${data.name}`,
		text,
	});

	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = setTimeout(() => {
			reject(new Error("Resend timeout"));
		}, RESEND_TIMEOUT_MS);
	});

	try {
		const { data: sent, error } = await Promise.race([sendPromise, timeoutPromise]);

		if (error) {
			return {
				ok: false,
				message: `Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę lub napisz na ${EMAIL_CONTACT}.`,
			};
		}

		if (!sent?.id) {
			return {
				ok: false,
				message: `Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę lub napisz na ${EMAIL_CONTACT}.`,
			};
		}

		return { ok: true };
	} catch {
		return {
			ok: false,
			message: `Przekroczono czas oczekiwania na e-mail. Spróbuj ponownie lub napisz na ${EMAIL_CONTACT}.`,
		};
	} finally {
		if (timeoutId !== undefined) clearTimeout(timeoutId);
	}
}
