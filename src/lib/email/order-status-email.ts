import "server-only";

import {
	getEmailTemplateForSend,
	isEmailTemplateEnabledForSend,
} from "@/lib/admin/email-templates";
import type { AdminOrderDetail } from "@/lib/admin/orders";
import { getAdminOrderForEmail } from "@/lib/admin/orders";
import { EMAIL_CONTACT, SITE_URL } from "@/lib/email/constants";
import { buildOrderRenderContext, mergeSubject, renderTemplate } from "@/lib/email/render-template";
import { sendTransactionalEmail } from "@/lib/email/send-transactional";
import { formatPrice } from "@/lib/format";

/** Etapy widoczne dla klienta — każda akcja w panelu wysyła osobny e-mail. */
export type OrderEmailStage =
	| "placed"
	| "realization_started"
	| "shipped"
	| "completed"
	| "cancelled";

type StageCopy = {
	subject: (displayId: number) => string;
	headline: string;
	body: string[];
};

const STAGE_COPY: Record<OrderEmailStage, StageCopy> = {
	placed: {
		subject: (id) => `[RetroHouse] Dziękujemy za zamówienie #${id}`,
		headline: "Dziękujemy za złożenie zamówienia!",
		body: [
			"Otrzymaliśmy Twoje zamówienie i właśnie je przetwarzamy.",
			"Gdy je zaakceptujemy, wyślemy kolejne potwierdzenie o rozpoczęciu realizacji.",
		],
	},
	realization_started: {
		subject: (id) => `[RetroHouse] Rozpoczęliśmy realizację zamówienia #${id}`,
		headline: "Rozpoczęcie realizacji",
		body: [
			"Twoje zamówienie zostało zaakceptowane i przekazane do realizacji.",
			"Pakujemy przedmioty z dbałością o bezpieczny transport — damy znać, gdy kurier odbierze paczkę.",
		],
	},
	shipped: {
		subject: (id) => `[RetroHouse] Przesyłka w drodze — zamówienie #${id}`,
		headline: "Przesyłka odebrana przez kuriera",
		body: [
			"Paczka opuściła nasz magazyn — kurier właśnie ją przewozi.",
			"Śledzenie przesyłki otrzymasz od przewoźnika, jeśli dotyczy wybranej metody dostawy.",
		],
	},
	completed: {
		subject: (id) => `[RetroHouse] Zamówienie #${id} zakończone`,
		headline: "Zamówienie zakończone",
		body: [
			"Dziękujemy za zakupy w RetroHouse. Mamy nadzieję, że antyki cieszą w Twoim wnętrzu.",
			`Masz 14 dni na odstąpienie od umowy — szczegóły: ${SITE_URL}/odstapienie`,
		],
	},
	cancelled: {
		subject: (id) => `[RetroHouse] Zamówienie #${id} anulowane`,
		headline: "Zamówienie zostało anulowane",
		body: [
			"Twoje zamówienie zostało anulowane. Jeśli płatność została pobrana, zwrot środków nastąpi zgodnie z regulaminem.",
			`Pytania? Napisz na ${EMAIL_CONTACT}`,
		],
	},
};

function customerName(order: AdminOrderDetail): string {
	const fromAddress = order.shippingAddress
		? [order.shippingAddress.firstName, order.shippingAddress.lastName].filter(Boolean).join(" ")
		: "";
	return fromAddress.trim() || order.email.split("@")[0] || "Kliencie";
}

function formatItemsSummary(order: AdminOrderDetail): string {
	return order.items
		.map(
			(item) =>
				`• ${item.title}${item.quantity > 1 ? ` × ${item.quantity}` : ""} — ${formatPrice(item.total, order.currencyCode)}`,
		)
		.join("\n");
}

function esc(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function buildHtml(order: AdminOrderDetail, copy: StageCopy): string {
	const name = esc(customerName(order));
	const itemsHtml = order.items
		.map(
			(item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e8dcc0">${esc(item.title)}${item.quantity > 1 ? ` × ${item.quantity}` : ""}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e8dcc0;text-align:right;white-space:nowrap">${formatPrice(item.total, order.currencyCode)}</td>
      </tr>`,
		)
		.join("");

	const bodyParagraphs = copy.body
		.map(
			(p) =>
				`<p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#5a4a3a">${esc(p)}</p>`,
		)
		.join("");

	return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;color:#2a1f14">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#fffdf8;border-radius:16px;border:1px solid #e8dcc0;overflow:hidden">
        <tr><td style="background:#2a1f14;padding:24px 32px">
          <p style="margin:0;font-size:24px;color:#e8dcc0;letter-spacing:0.05em">RetroHouse</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="font-size:20px;font-weight:600;margin:0 0 4px">Cześć ${name},</p>
          <p style="font-size:18px;font-weight:600;margin:0 0 8px;color:#c8622a">${esc(copy.headline)}</p>
          <p style="color:#7a6a5a;margin:0 0 20px;font-size:14px">Zamówienie #${order.displayId}</p>
          ${bodyParagraphs}
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 8px">${itemsHtml}</table>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #2a1f14;margin-bottom:24px">
            <tr>
              <td style="padding:12px 0;font-size:16px;font-weight:700">Razem</td>
              <td style="padding:12px 0;font-size:16px;font-weight:700;text-align:right">${formatPrice(order.total, order.currencyCode)}</td>
            </tr>
          </table>
          ${order.shippingMethodName ? `<p style="font-size:13px;color:#7a6a5a;margin:0 0 16px">Dostawa: ${esc(order.shippingMethodName)}</p>` : ""}
          <p style="font-size:12px;color:#9a8a7a;line-height:1.6">
            Pytania? <a href="mailto:${EMAIL_CONTACT}" style="color:#c8622a">${EMAIL_CONTACT}</a>
          </p>
        </td></tr>
        <tr><td style="background:#f0ebe0;padding:16px 32px;border-top:1px solid #e8dcc0">
          <p style="margin:0;font-size:11px;color:#9a8a7a">RetroHouse · ul. Ludźmierska 25A, 34-400 Nowy Targ</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildText(order: AdminOrderDetail, copy: StageCopy): string {
	const name = customerName(order);
	return [
		`Cześć ${name},`,
		``,
		copy.headline,
		`Zamówienie #${order.displayId}`,
		``,
		...copy.body,
		``,
		`── POZYCJE ──`,
		formatItemsSummary(order),
		``,
		`Razem: ${formatPrice(order.total, order.currencyCode)}`,
		order.shippingMethodName ? `Dostawa: ${order.shippingMethodName}` : "",
		``,
		`Pytania? ${EMAIL_CONTACT}`,
		``,
		`Pozdrawiamy,`,
		`Zespół RetroHouse`,
	]
		.filter(Boolean)
		.join("\n");
}

function buildShopHtml(order: AdminOrderDetail): string {
	const adminUrl = `${SITE_URL}/magazyn/zamowienia/${order.id}`;
	const name = esc(customerName(order));
	const itemsHtml = order.items
		.map(
			(item) =>
				`<tr><td style="padding:6px 0;border-bottom:1px solid #e8dcc0">${esc(item.title)} × ${item.quantity}</td><td style="padding:6px 0;border-bottom:1px solid #e8dcc0;text-align:right">${formatPrice(item.total, order.currencyCode)}</td></tr>`,
		)
		.join("");

	return `<!DOCTYPE html><html lang="pl"><body style="font-family:Georgia,serif;color:#2a1f14;background:#f5f0e8;padding:24px">
<table width="100%" style="max-width:560px;margin:0 auto;background:#fffdf8;border:1px solid #e8dcc0;border-radius:12px;padding:24px">
<tr><td>
<p style="font-size:20px;font-weight:600;margin:0 0 8px">Nowe zamówienie #${order.displayId}</p>
<p style="color:#7a6a5a;margin:0 0 16px">Powiadomienie z systemu sklepu — zamówienie wymaga akceptacji w magazynie.</p>
<p style="margin:0 0 4px"><strong>${name}</strong></p>
<p style="margin:0 0 4px">${esc(order.email)}</p>
${order.phone ? `<p style="margin:0 0 16px">${esc(order.phone)}</p>` : ""}
<table width="100%">${itemsHtml}</table>
<p style="font-size:16px;font-weight:700;margin:16px 0">Razem: ${formatPrice(order.total, order.currencyCode)}</p>
<p><a href="${adminUrl}" style="color:#c8622a;font-weight:600">Otwórz w magazynie →</a></p>
</td></tr></table></body></html>`;
}

function buildShopText(order: AdminOrderDetail): string {
	const adminUrl = `${SITE_URL}/magazyn/zamowienia/${order.id}`;
	return [
		`Nowe zamówienie #${order.displayId} — powiadomienie z systemu sklepu`,
		``,
		`Złożone przez klienta na sklep-retrohouse.pl. Wymaga akceptacji w magazynie.`,
		`Klient: ${customerName(order)}`,
		`E-mail: ${order.email}`,
		order.phone ? `Tel: ${order.phone}` : "",
		``,
		formatItemsSummary(order),
		``,
		`Razem: ${formatPrice(order.total, order.currencyCode)}`,
		order.shippingMethodName ? `Dostawa: ${order.shippingMethodName}` : "",
		``,
		`Panel: ${adminUrl}`,
	]
		.filter(Boolean)
		.join("\n");
}

/**
 * Wynik wysyłki. `ok: false` NIE jest wyjątkiem — wołający musi sam sprawdzić
 * to pole. Wcześniej powód porażki Resenda ginął bez śladu, więc opakowanie
 * wysyłki w `Promise.allSettled` nie logowało niczego.
 */
export type EmailOutcome = { ok: boolean; skipped?: boolean; error?: string };

/** E-mail do klienta po zmianie statusu. */
export async function sendOrderStatusEmail(
	orderId: string,
	stage: OrderEmailStage,
): Promise<EmailOutcome> {
	const order = await getAdminOrderForEmail(orderId);
	if (!order?.email.trim()) return { ok: true, skipped: true };

	if (!(await isEmailTemplateEnabledForSend(stage).catch(() => true))) {
		return { ok: true, skipped: true };
	}

	// Override z wizualnego edytora (/magazyn/maile — E-maile); fallback do szablonu w kodzie.
	const saved = await getEmailTemplateForSend(stage).catch(() => null);

	let subject: string;
	let text: string;
	let html: string;

	if (saved) {
		const ctx = buildOrderRenderContext(order);
		const rendered = renderTemplate(saved, ctx);
		subject = mergeSubject(saved.subject, ctx.vars);
		text = rendered.text;
		html = rendered.html;
	} else {
		const copy = STAGE_COPY[stage];
		subject = copy.subject(order.displayId);
		text = buildText(order, copy);
		html = buildHtml(order, copy);
	}

	const result = await sendTransactionalEmail({ to: order.email, subject, text, html });
	return result.ok ? { ok: true, skipped: result.skipped } : { ok: false, error: result.message };
}

/** E-mail wewnętrzny — tylko przy nowym zamówieniu do akceptacji. */
export async function sendNewOrderShopNotification(orderId: string): Promise<EmailOutcome> {
	const order = await getAdminOrderForEmail(orderId);
	if (!order) return { ok: true, skipped: true };

	const result = await sendTransactionalEmail({
		to: EMAIL_CONTACT,
		subject: `[RetroHouse · System] Nowe zamówienie #${order.displayId} do akceptacji`,
		text: buildShopText(order),
		html: buildShopHtml(order),
	});

	return result.ok ? { ok: true, skipped: result.skipped } : { ok: false, error: result.message };
}
