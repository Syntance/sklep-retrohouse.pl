import "server-only";

import {
	getEmailTemplateForSend,
	isEmailTemplateEnabledForSend,
} from "@/lib/admin/email-templates";
import { buildDefaultTemplate } from "@/lib/email/template-types";
import type { CaseEmailRenderVars } from "@/lib/email/case-email-context";
import {
	mergeSubject,
	renderTemplate,
	type EmailRenderContext,
} from "@/lib/email/render-template";
import { sendTransactionalEmail } from "@/lib/email/send-transactional";
import type { EmailTemplateType } from "@/lib/email/template-types";

type SendCaseCustomerEmailInput = {
	templateType: EmailTemplateType;
	to: string;
	vars: CaseEmailRenderVars;
	/** Gdy brak zapisanego szablonu w magazynie — treść z kodu. */
	fallback: { subject: string; text: string; html: string };
};

function toRenderContext(vars: CaseEmailRenderVars): EmailRenderContext {
	return { vars: { ...vars }, items: [] };
}

/** Wysyłka e-maila sprawy — szablon z /magazyn/maile (E-maile) lub fallback. */
export async function sendCaseCustomerEmail(
	input: SendCaseCustomerEmailInput,
): Promise<{ ok: boolean; skipped?: boolean }> {
	const ctx = toRenderContext(input.vars);

	if (!(await isEmailTemplateEnabledForSend(input.templateType).catch(() => true))) {
		return { ok: true, skipped: true };
	}

	const saved = await getEmailTemplateForSend(input.templateType).catch(() => null);

	let subject: string;
	let text: string;
	let html: string;

	if (saved) {
		const rendered = renderTemplate(saved, ctx);
		subject = mergeSubject(saved.subject, ctx.vars);
		text = rendered.text;
		html = rendered.html;
	} else {
		subject = input.fallback.subject;
		text = input.fallback.text;
		html = input.fallback.html;
	}

	const result = await sendTransactionalEmail({
		to: input.to,
		subject,
		text,
		html,
	});

	return result.ok ? { ok: true, skipped: result.skipped } : { ok: false };
}

/** Temat domyślny (bez zapisu w magazynie) — z szablonu kodowego. */
export function defaultCaseEmailSubject(
	templateType: EmailTemplateType,
	vars: CaseEmailRenderVars,
): string {
	const template = buildDefaultTemplate(templateType);
	return mergeSubject(template.subject, vars);
}
