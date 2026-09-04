import type { ReturnRequestType } from "@/lib/admin/return-types";
import { SITE_URL } from "@/lib/email/constants";

type CustomerCaseEmailTab = "reklamacje" | "zwroty";

const KONTO_CTA_LABEL = "Przejdź do panelu konta";

function siteBaseUrl(): string {
	const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
	return (fromEnv && fromEnv.length > 0 ? fromEnv : SITE_URL).replace(/\/$/, "");
}

/** URL panelu klienta — opcjonalnie z aktywną zakładką. */
export function getCustomerKontoUrl(tab?: CustomerCaseEmailTab): string {
	const base = siteBaseUrl();
	return tab ? `${base}/konto?tab=${tab}` : `${base}/konto`;
}

export function customerCaseEmailTab(requestType: ReturnRequestType): CustomerCaseEmailTab {
	return requestType === "claim" ? "reklamacje" : "zwroty";
}

/** Stopka plain-text z linkiem do logowania w /konto. */
function appendCustomerKontoPanelCtaText(message: string, tab?: CustomerCaseEmailTab): string {
	const url = getCustomerKontoUrl(tab);
	return (
		`${message.trim()}\n\n` +
		`Status wniosku i zamówień sprawdzisz w panelu konta (logowanie kodem z e-maila):\n` +
		`${url}`
	);
}

/** Przycisk CTA w HTML (tabele — lepsza kompatybilność z klientami poczty). */
function buildCustomerKontoPanelCtaHtml(tab?: CustomerCaseEmailTab): string {
	const url = getCustomerKontoUrl(tab);
	const escUrl = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
	return (
		`<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0">` +
		`<tr><td style="background:#c8622a;border-radius:8px">` +
		`<a href="${escUrl}" target="_blank" rel="noopener" ` +
		`style="display:inline-block;padding:12px 24px;color:#fffdf8;font-weight:700;font-size:14px;text-decoration:none;font-family:system-ui,sans-serif">` +
		`${KONTO_CTA_LABEL}</a></td></tr></table>` +
		`<p style="margin:12px 0 0;font-size:12px;color:#7a6a5a;font-family:system-ui,sans-serif">` +
		`Logowanie kodem wysłanym na adres z zamówienia.</p>`
	);
}

/** Owija treść e-maila + przycisk do panelu. */
function wrapCustomerCaseEmailHtml(bodyHtml: string, tab?: CustomerCaseEmailTab): string {
	return (
		`<div style="font-family:system-ui,sans-serif;max-width:500px;padding:24px;color:#2D1810">` +
		`${bodyHtml}${buildCustomerKontoPanelCtaHtml(tab)}` +
		`</div>`
	);
}

export function buildCustomerCaseEmailBodies(opts: {
	textBody: string;
	htmlBody: string;
	tab?: CustomerCaseEmailTab;
}): { text: string; html: string } {
	return {
		text: appendCustomerKontoPanelCtaText(opts.textBody, opts.tab),
		html: wrapCustomerCaseEmailHtml(opts.htmlBody, opts.tab),
	};
}
