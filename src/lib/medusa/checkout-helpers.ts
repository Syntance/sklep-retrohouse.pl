/**
 * Helpers dla checkout flow — retry logic, error handling, cart completion.
 * Wzorowane na lumineconcept, uproszczone dla RetroHouse (qty=1, brak PayPo).
 */

export const TPAY_PROVIDER_ID = "pp_tpay_tpay";
export const SYSTEM_PAYMENT_PROVIDER_ID = "pp_system_default";

/**
 * Lista providerów widocznych w checkoutcie RetroHouse.
 * Tpay = płatności online (BLIK, szybki przelew, karta).
 * System default = przelew tradycyjny (B2B).
 */
export const CHECKOUT_VISIBLE_PROVIDER_IDS = [
  TPAY_PROVIDER_ID,
  SYSTEM_PAYMENT_PROVIDER_ID,
];

/**
 * Harmonogram odpytań finalizacji. Webhook Tpay (notificationUrl) dociera
 * asynchronicznie — czasem ułamek sekundy po powrocie klienta, czasem kilka sekund.
 * Dopóki płatność nie jest potwierdzona, ponawiamy.
 */
export const POLL_DELAYS_MS = [800, 1200, 1800, 2500, 3000, 3000, 4000, 4000];

/**
 * Wykrywa błąd „koszyk już domknięty" (wyścig ze storefrontem / webhookiem).
 */
export function isCartAlreadyCompletedError(e: unknown): boolean {
  const msg =
    typeof e === "string"
      ? e
      : typeof (e as { message?: string })?.message === "string"
        ? (e as { message: string }).message
        : "";
  return /already\s+completed/i.test(msg);
}

/**
 * Opisuje błąd Medusa w user-friendly PL.
 */
export function describeMedusaError(e: unknown, fallback: string): string {
  const raw = (e ?? {}) as {
    message?: string;
    error?: { message?: string };
    type?: string;
    code?: string;
  };

  let msg = "";
  if (typeof raw.message === "string") msg = raw.message;
  else if (typeof raw.error?.message === "string") msg = raw.error.message;
  else if (typeof e === "string") msg = e;

  if (msg && /already\s+completed/i.test(msg)) {
    return "Koszyk został już sfinalizowany. Zacznij od nowa.";
  }

  if (msg) return msg;

  const type = raw.type ?? "";
  const code = raw.code ?? "";
  if (type || code) return `${type} (${code})`;

  return fallback;
}
