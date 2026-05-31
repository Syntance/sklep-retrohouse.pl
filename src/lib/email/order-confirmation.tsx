import "server-only";

import { Resend } from "resend";
import { env } from "@/env";
import { EMAIL_CONTACT, EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/email/constants";
import type { OrderAcceptance, LineItemAcceptance } from "@/lib/order-acceptance";

const RESEND_TIMEOUT_MS = 10_000;

/** Parametry potrzebne do wysłania e-maila z potwierdzeniem zamówienia. */
export type OrderConfirmationData = {
	orderId: string;
	customerEmail: string;
	customerName: string;
	items: Array<{
		name: string;
		price: number;
		slug: string;
		acceptance: LineItemAcceptance;
	}>;
	shippingMethod: string;
	totalPrice: number;
	acceptance: OrderAcceptance;
};

export type SendOrderConfirmationResult =
	| { ok: true; skipped?: boolean }
	| { ok: false; message: string };

/**
 * Wysyła e-mail z potwierdzeniem zamówienia do klienta.
 *
 * Zawiera (wymogi art. 21 UPK):
 *  - pouczenie o prawie odstąpienia (14 dni)
 *  - link do formularza /odstapienie
 *  - link do regulaminu (wersja z momentu zakupu)
 *  - link do /reklamacje
 *  - snapshot opisu stanu każdego przedmiotu
 *
 * Załączniki PDF (formularz UPK + regulamin) należy wgrać do Vercel Blob
 * lub R2 i podmienić URL-e poniżej gdy będą dostępne.
 */
export async function sendOrderConfirmation(
	data: OrderConfirmationData,
): Promise<SendOrderConfirmationResult> {
	const apiKey = env.RESEND_API_KEY;
	if (!apiKey) {
		return { ok: true, skipped: true };
	}

	const from = env.RESEND_FROM_EMAIL ? `RetroHouse <${env.RESEND_FROM_EMAIL}>` : EMAIL_FROM;

	const resend = new Resend(apiKey);

	const subject = `[RetroHouse] Potwierdzenie zamówienia #${data.orderId}`;

	const itemsText = data.items
		.map(
			(item) =>
				`• ${item.name} — ${(item.price / 100).toFixed(2).replace(".", ",")} zł\n` +
				`  Opis stanu (v. ${item.acceptance.productDescriptionVersion}):\n` +
				`  ${item.acceptance.productDescriptionSnapshot}`,
		)
		.join("\n\n");

	const text = [
		`Cześć ${data.customerName},`,
		``,
		`Dziękujemy za zamówienie #${data.orderId} w RetroHouse.`,
		``,
		`── ZAMÓWIONE PRZEDMIOTY ───────────────────────────────`,
		itemsText,
		``,
		`Wysyłka: ${data.shippingMethod}`,
		`Razem: ${(data.totalPrice / 100).toFixed(2).replace(".", ",")} zł`,
		``,
		`── PRAWO ODSTĄPIENIA OD UMOWY (art. 27 UPK) ──────────`,
		`Masz 14 dni na odstąpienie od umowy od dnia otrzymania przesyłki`,
		`— bez podania przyczyny.`,
		`Formularz odstąpienia i pełna procedura: https://sklep-retrohouse.pl/odstapienie`,
		``,
		`Pamiętaj: antyki są rzeczami używanymi. Odpowiadasz za zmniejszenie`,
		`wartości przedmiotu wynikłe z korzystania ponad to, co konieczne do`,
		`sprawdzenia jego charakteru (art. 34 ust. 4 UPK).`,
		``,
		`── REKLAMACJE ──────────────────────────────────────────`,
		`Procedura reklamacyjna: https://sklep-retrohouse.pl/reklamacje`,
		``,
		`── DOKUMENTY ───────────────────────────────────────────`,
		`Regulamin (v. ${data.acceptance.termsVersion}): https://sklep-retrohouse.pl/regulamin`,
		`Polityka prywatności: https://sklep-retrohouse.pl/polityka-prywatnosci`,
		``,
		`Pytania? Napisz na ${EMAIL_CONTACT} lub przez`,
		`https://sklep-retrohouse.pl/kontakt`,
		``,
		`Pozdrawiamy,`,
		`Zespół RetroHouse`,
		`ul. Ludźmierska 25A, 34-400 Nowy Targ`,
	].join("\n");

	const html = buildHtml(data, itemsText);

	const sendPromise = resend.emails.send({
		from,
		to: [data.customerEmail],
		replyTo: EMAIL_REPLY_TO,
		subject,
		text,
		html,
		// TODO: gdy pliki PDF będą dostępne w Vercel Blob / R2, odkomentuj:
		// attachments: [
		//   { filename: "formularz-odstapienia-upk.pdf", path: "https://..." },
		//   { filename: `regulamin-${data.acceptance.termsVersion}.pdf`, path: "https://..." },
		// ],
	});

	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = setTimeout(() => reject(new Error("Resend timeout")), RESEND_TIMEOUT_MS);
	});

	try {
		const { data: sent, error } = await Promise.race([sendPromise, timeoutPromise]);
		if (error || !sent?.id) {
			return { ok: false, message: "Nie udało się wysłać e-maila z potwierdzeniem." };
		}
		return { ok: true };
	} catch {
		return { ok: false, message: "Przekroczono czas oczekiwania na wysyłkę e-maila." };
	} finally {
		if (timeoutId !== undefined) clearTimeout(timeoutId);
	}
}

/* ────────────────────────────────────────────── */
/* HTML template                                  */
/* ────────────────────────────────────────────── */

function buildHtml(data: OrderConfirmationData, _itemsText: string): string {
	const itemRows = data.items
		.map(
			(item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e8dcc0;font-weight:600">
        ${esc(item.name)}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #e8dcc0;text-align:right;white-space:nowrap">
        ${(item.price / 100).toFixed(2).replace(".", ",")} zł
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding:0 0 16px;font-size:13px;color:#7a6a5a;line-height:1.6">
        <strong>Opis stanu (v.${esc(item.acceptance.productDescriptionVersion)}):</strong><br>
        ${esc(item.acceptance.productDescriptionSnapshot)}
      </td>
    </tr>`,
		)
		.join("");

	return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;color:#2a1f14">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#fffdf8;border-radius:16px;border:1px solid #e8dcc0;overflow:hidden">

        <!-- Header -->
        <tr><td style="background:#2a1f14;padding:24px 32px">
          <p style="margin:0;font-size:24px;color:#e8dcc0;letter-spacing:0.05em">RetroHouse</p>
          <p style="margin:4px 0 0;font-size:11px;color:#c8a87a;text-transform:uppercase;letter-spacing:0.2em">est. 2026</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px">
          <p style="font-size:20px;font-weight:600;margin:0 0 8px">
            Dziękujemy za zamówienie, ${esc(data.customerName)}!
          </p>
          <p style="color:#7a6a5a;margin:0 0 24px;font-size:14px">
            Zamówienie #${esc(data.orderId)}
          </p>

          <!-- Items -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            ${itemRows}
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #2a1f14;margin-bottom:32px">
            <tr>
              <td style="padding:12px 0;font-size:18px;font-weight:700">Razem</td>
              <td style="padding:12px 0;font-size:18px;font-weight:700;text-align:right">
                ${(data.totalPrice / 100).toFixed(2).replace(".", ",")} zł
              </td>
            </tr>
          </table>

          <!-- Withdrawal notice (art. 21 UPK) -->
          <div style="background:#fdf3e8;border:1px solid #e8b06a;border-radius:12px;padding:20px;margin-bottom:24px">
            <p style="margin:0 0 8px;font-weight:700;font-size:15px">Prawo odstąpienia od umowy</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#5a3a1a">
              Masz <strong>14 dni na odstąpienie od umowy</strong> od dnia otrzymania przesyłki
              — bez podania przyczyny (art. 27 UPK).<br><br>
              Formularz i pełna procedura:
              <a href="https://sklep-retrohouse.pl/odstapienie" style="color:#c8622a;font-weight:600">
                sklep-retrohouse.pl/odstapienie
              </a><br><br>
              Pamiętaj: antyki są rzeczami używanymi. Odpowiadasz za zmniejszenie wartości
              wynikłe z korzystania ponad to, co konieczne do sprawdzenia charakteru przedmiotu
              (art. 34 ust. 4 UPK).
            </p>
          </div>

          <!-- Links -->
          <p style="font-size:13px;color:#7a6a5a;line-height:2">
            📋 <a href="https://sklep-retrohouse.pl/reklamacje" style="color:#c8622a">Reklamacje</a> &nbsp;·&nbsp;
            <a href="https://sklep-retrohouse.pl/regulamin" style="color:#c8622a">Regulamin (v.${esc(data.acceptance.termsVersion)})</a> &nbsp;·&nbsp;
            <a href="https://sklep-retrohouse.pl/polityka-prywatnosci" style="color:#c8622a">Polityka prywatności</a>
          </p>
          <p style="font-size:12px;color:#9a8a7a;margin-top:8px">
            Pytania? <a href="mailto:${EMAIL_CONTACT}" style="color:#c8622a">${EMAIL_CONTACT}</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f0ebe0;padding:16px 32px;border-top:1px solid #e8dcc0">
          <p style="margin:0;font-size:11px;color:#9a8a7a;line-height:1.6">
            RetroHouse · ul. Ludźmierska 25A, 34-400 Nowy Targ<br>
            Możesz zrezygnować z komunikacji marketingowej w ustawieniach konta
            lub pisząc na ${EMAIL_CONTACT}.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function esc(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}
