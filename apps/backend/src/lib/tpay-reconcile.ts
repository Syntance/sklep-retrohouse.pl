/**
 * Logika rekoncyliacji płatności Tpay — czyste funkcje, testowalne bez Medusy.
 *
 * Wzorzec branżowy (Stripe/Shopify/Woo): webhook bramki jest głównym torem
 * domykania płatności, a cykliczna rekoncyliacja łapie wszystko, co webhook
 * zgubił (restart, firewall, deploy, opóźniona wpłata). Zamówienie powstaje
 * WYŁĄCZNIE gdy provider potwierdzi środki (authorizePayment robi pull-based
 * `GET /transactions/{id}` w Tpay) — cron nigdy nie tworzy zamówienia „na kredyt".
 */

export const TPAY_PROVIDER_ID = "pp_tpay_tpay";

/**
 * Okno rekoncyliacji — Tpay: transakcje ważne do 7 dni (auto-cancel po 7 dniach
 * bez callback URL zgodnie z Terms and Conditions).
 */
export const RECONCILE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Minimalny wiek sesji zanim cron jej dotknie. Świeże sesje obsługuje
 * storefront (strona powrotu) i webhook — nie chcemy ścigać się z klientem,
 * który właśnie wpisuje BLIK na stronie Tpay.
 */
export const RECONCILE_MIN_AGE_MS = 10 * 60 * 1000;

/** Limit koszyków na jeden przebieg — chroni Tpay API i workflow engine. */
export const RECONCILE_MAX_PER_RUN = 25;

export type TpaySessionRow = {
  id?: string | null;
  provider_id?: string | null;
  status?: string | null;
  created_at?: string | Date | null;
  payment_collection_id?: string | null;
};

function ageMs(createdAt: string | Date | null | undefined, now: number): number | null {
  if (!createdAt) return null;
  const t = new Date(createdAt).getTime();
  if (!Number.isFinite(t)) return null;
  return now - t;
}

/**
 * Sesja kwalifikuje się do rekoncyliacji gdy:
 *  - należy do providera Tpay,
 *  - jest w stanie `pending` (authorized/captured obsłużyła już Medusa),
 *  - jest starsza niż MIN_AGE (klient mógł skończyć płacić sam),
 *  - mieści się w oknie (starsze transakcje Tpay i tak wygasły).
 */
export function isReconcilableSession(
  row: TpaySessionRow,
  now: number = Date.now(),
): boolean {
  if (row.provider_id !== TPAY_PROVIDER_ID) return false;
  if ((row.status ?? "pending") !== "pending") return false;
  if (!row.payment_collection_id) return false;
  const age = ageMs(row.created_at, now);
  if (age === null) return false;
  return age >= RECONCILE_MIN_AGE_MS && age <= RECONCILE_WINDOW_MS;
}

export type CompleteCartErrorKind =
  | "payment_pending"
  | "already_completed"
  | "error";

/**
 * Klasyfikuje błąd `completeCartWorkflow`:
 *  - `payment_pending` — provider nie potwierdził środków (normalny stan,
 *    autoryzacja rzuca `PAYMENT_AUTHORIZATION_ERROR` / "Payment authorization failed"),
 *  - `already_completed` — wyścig ze storefrontem / webhookiem (też OK),
 *  - `error` — realny problem do zalogowania.
 */
export function classifyCompleteCartError(e: unknown): CompleteCartErrorKind {
  const raw = (e ?? {}) as { message?: string; type?: string };
  const msg = typeof raw.message === "string" ? raw.message : String(e ?? "");
  const type = raw.type ?? "";

  if (
    type === "payment_authorization_error" ||
    type === "payment_requires_more_error" ||
    /payment authorization/i.test(msg) ||
    /more information is required/i.test(msg)
  ) {
    return "payment_pending";
  }
  if (/already\s+completed/i.test(msg)) {
    return "already_completed";
  }
  return "error";
}

/** Unikalne, niepuste cart_id z wierszy linku cart↔payment_collection. */
export function uniqueCartIds(
  rows: Array<{ cart_id?: string | null }>,
): string[] {
  const out = new Set<string>();
  for (const row of rows) {
    const id = row.cart_id?.trim();
    if (id) out.add(id);
  }
  return [...out];
}
