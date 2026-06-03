import "server-only";

import type { ReturnRequest } from "@/lib/admin/return-types";
import type { ReturnStatus } from "@/lib/admin/return-types";
import { buildCaseRenderVarsFromReturn } from "@/lib/email/case-email-context";
import {
	buildCustomerCaseEmailBodies,
	customerCaseEmailTab,
} from "@/lib/email/customer-case-email";
import { templateTypeForReturnStatus } from "@/lib/email/case-email-template-map";
import {
	defaultCaseEmailSubject,
	sendCaseCustomerEmail,
} from "@/lib/email/send-case-customer-email";

function caseNoun(requestType: ReturnRequest["requestType"]): {
	short: string;
	genitive: string;
} {
	if (requestType === "claim") {
		return { short: "reklamacja", genitive: "reklamacji" };
	}
	return { short: "odstąpienie od umowy", genitive: "odstąpienia od umowy" };
}

function buildFallbackBodies(
	returnReq: ReturnRequest,
	status: ReturnStatus,
	extra?: { rejectionReason?: string },
): { subject: string; text: string; html: string } | null {
	const tab = customerCaseEmailTab(returnReq.requestType);
	const noun = caseNoun(returnReq.requestType);
	const orderRef = `#${returnReq.orderDisplayId}`;
	const claimRef =
		returnReq.requestType === "claim" && returnReq.claimReferenceId
			? `<br>Numer zgłoszenia: <strong>${returnReq.claimReferenceId}</strong>`
			: "";
	const claimRefText =
		returnReq.requestType === "claim" && returnReq.claimReferenceId
			? `\nNumer zgłoszenia: ${returnReq.claimReferenceId}`
			: "";

	if (status === "approved") {
		const textBody =
			`Zaakceptowaliśmy Twoją ${noun.short} (zamówienie ${orderRef}).${claimRefText}\n\n` +
			`Wyślij przesyłkę zwrotną na adres:\n` +
			`RetroHouse\nul. Ludźmierska 25A\n34-400 Nowy Targ\n\n` +
			`Po otrzymaniu towaru prześlemy rozliczenie.`;
		const htmlBody =
			`<h2 style="color:#2D1810;margin:0 0 12px">${noun.short.charAt(0).toUpperCase() + noun.short.slice(1)} zaakceptowana</h2>` +
			`<p>Zamówienie <strong>${orderRef}</strong>${claimRef}</p>` +
			`<p style="color:#5a4a3a;line-height:1.6">Wyślij przesyłkę zwrotną na adres:<br>` +
			`<strong>RetroHouse</strong><br>ul. Ludźmierska 25A<br>34-400 Nowy Targ</p>` +
			`<p style="color:#666">Po otrzymaniu towaru prześlemy rozliczenie.</p>`;
		const templateType = templateTypeForReturnStatus(returnReq.requestType, status);
		if (!templateType) return null;
		const vars = buildCaseRenderVarsFromReturn(returnReq, extra);
		return {
			subject: defaultCaseEmailSubject(templateType, vars),
			...buildCustomerCaseEmailBodies({ textBody, htmlBody, tab }),
		};
	}

	if (status === "refunded") {
		const vars = buildCaseRenderVarsFromReturn(returnReq, extra);
		const textBody =
			`Zwróciliśmy środki w związku z ${noun.genitive} (zamówienie ${orderRef}).${claimRefText}\n\n` +
			`Kwota ${vars.kwotaZwrotu} zostanie na Twoim koncie w ciągu 3–5 dni roboczych.`;
		const htmlBody =
			`<h2 style="color:#2D1810;margin:0 0 12px">Zwrot środków</h2>` +
			`<p>Zamówienie <strong>${orderRef}</strong>${claimRef}</p>` +
			`<p style="color:#5a4a3a">Kwota <strong>${vars.kwotaZwrotu}</strong> zostanie na Twoim koncie w ciągu 3–5 dni roboczych.</p>`;
		return {
			subject: defaultCaseEmailSubject("case_refunded", vars),
			...buildCustomerCaseEmailBodies({ textBody, htmlBody, tab }),
		};
	}

	if (status === "rejected") {
		const reason = extra?.rejectionReason?.trim() || "Nie podano przyczyny";
		const textBody =
			`Twój wniosek o ${noun.short} (zamówienie ${orderRef}) został odrzucony.${claimRefText}\n\n` +
			`Powód: ${reason}\n\n` +
			`Jeśli masz pytania, odpowiedz na ten e-mail lub skontaktuj się z nami.`;
		const htmlBody =
			`<h2 style="color:#2D1810;margin:0 0 12px">Wniosek odrzucony</h2>` +
			`<p>Zamówienie <strong>${orderRef}</strong>${claimRef}</p>` +
			`<p style="color:#5a4a3a"><strong>Powód:</strong> ${reason.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>` +
			`<p style="color:#666">Masz pytania? Odpowiedz na ten e-mail.</p>`;
		const templateType = templateTypeForReturnStatus(returnReq.requestType, status);
		if (!templateType) return null;
		const vars = buildCaseRenderVarsFromReturn(returnReq, extra);
		return {
			subject: defaultCaseEmailSubject(templateType, vars),
			...buildCustomerCaseEmailBodies({ textBody, htmlBody, tab }),
		};
	}

	return null;
}

/** Treść e-maila do klienta po zmianie statusu w magazynie (approved / refunded / rejected). */
export async function sendReturnStatusCustomerEmail(
	returnReq: ReturnRequest,
	status: ReturnStatus,
	extra?: { rejectionReason?: string },
): Promise<void> {
	const templateType = templateTypeForReturnStatus(returnReq.requestType, status);
	if (!templateType) return;

	const fallback = buildFallbackBodies(returnReq, status, extra);
	if (!fallback) return;

	const vars = buildCaseRenderVarsFromReturn(returnReq, extra);

	await sendCaseCustomerEmail({
		templateType,
		to: returnReq.customerEmail,
		vars,
		fallback,
	});
}
