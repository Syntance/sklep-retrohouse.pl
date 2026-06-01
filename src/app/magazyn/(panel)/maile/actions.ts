"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
	resetEmailTemplate,
	saveEmailTemplate,
} from "@/lib/admin/email-templates";
import { AdminApiError, AdminUnauthorizedError, adminUpload } from "@/lib/admin/medusa-admin";
import {
	mergeSubject,
	renderTemplate,
	sampleRenderContext,
} from "@/lib/email/render-template";
import { sendTransactionalEmail } from "@/lib/email/send-transactional";
import {
	type EmailTemplate,
	emailTemplateSchema,
	emailTemplateTypeSchema,
} from "@/lib/email/template-types";

export type EmailActionState = { ok: boolean; error: string | null };
export type ResetActionState = EmailActionState & { template?: EmailTemplate };
export type UploadActionState = EmailActionState & { url?: string };

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

function handleError(error: unknown, fallback: string): EmailActionState {
	if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
	if (error instanceof AdminApiError) return { ok: false, error: error.message };
	if (error instanceof Error) return { ok: false, error: error.message };
	return { ok: false, error: fallback };
}

export async function saveTemplateAction(template: unknown): Promise<EmailActionState> {
	const parsed = emailTemplateSchema.safeParse(template);
	if (!parsed.success) {
		return { ok: false, error: "Szablon zawiera nieprawidłowe dane." };
	}

	try {
		await saveEmailTemplate(parsed.data as EmailTemplate);
	} catch (error) {
		return handleError(error, "Nie udało się zapisać szablonu.");
	}

	revalidatePath("/magazyn/maile");
	return { ok: true, error: null };
}

export async function resetTemplateAction(type: unknown): Promise<ResetActionState> {
	const parsed = emailTemplateTypeSchema.safeParse(type);
	if (!parsed.success) return { ok: false, error: "Nieznany typ szablonu." };

	try {
		const template = await resetEmailTemplate(parsed.data);
		revalidatePath("/magazyn/maile");
		return { ok: true, error: null, template };
	} catch (error) {
		return handleError(error, "Nie udało się przywrócić szablonu.");
	}
}

export async function uploadEmailImageAction(formData: FormData): Promise<UploadActionState> {
	const file = formData.get("file");
	if (!(file instanceof File)) return { ok: false, error: "Brak pliku." };
	if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
		return { ok: false, error: "Dozwolone formaty: JPG, PNG, WEBP, GIF, AVIF." };
	}
	if (file.size > MAX_IMAGE_BYTES) {
		return { ok: false, error: "Maksymalny rozmiar obrazu to 10 MB." };
	}

	try {
		const urls = await adminUpload([file]);
		const url = urls[0];
		if (!url) return { ok: false, error: "Upload nie zwrócił adresu obrazu." };
		return { ok: true, error: null, url };
	} catch (error) {
		return handleError(error, "Upload obrazu nie powiódł się.");
	}
}

const testSchema = z.object({
	to: z.string().email("Podaj poprawny adres e-mail."),
	template: emailTemplateSchema,
});

export async function sendTestEmailAction(input: unknown): Promise<EmailActionState> {
	const parsed = testSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? "Błędne dane." };
	}

	const template = parsed.data.template as EmailTemplate;
	const ctx = sampleRenderContext();
	const { html, text } = renderTemplate(template, ctx);
	const subject = `[TEST] ${mergeSubject(template.subject, ctx.vars)}`;

	try {
		const result = await sendTransactionalEmail({
			to: parsed.data.to,
			subject,
			text,
			html,
		});
		if (!result.ok) return { ok: false, error: result.message };
		if (result.skipped) {
			return { ok: false, error: "Brak RESEND_API_KEY — test pominięty (skonfiguruj klucz)." };
		}
		return { ok: true, error: null };
	} catch {
		return { ok: false, error: "Nie udało się wysłać testu." };
	}
}
