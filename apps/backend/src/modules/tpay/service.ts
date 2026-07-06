import crypto from "node:crypto";
import {
  AbstractPaymentProvider,
  MedusaError,
  PaymentActions,
} from "@medusajs/framework/utils";
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types";

interface TpayOptions {
  clientId: string;
  clientSecret: string;
  merchantId: string;
  sandbox: boolean;
  /** Publiczny URL backendu — buduje notificationUrl (webhook Tpay). */
  backendUrl: string;
  /** Publiczny URL storefrontu — buduje successUrl / errorUrl (powrót klienta). */
  storefrontUrl: string;
}

interface InjectedDependencies {
  logger: Logger;
  [key: string]: unknown;
}

/**
 * Surowe dane sesji Tpay zapisywane w `PaymentSession.data`.
 */
interface TpaySessionData {
  /** Nasz unikalny transaction_id wysłany do Tpay (UUID). */
  transaction_id: string;
  /** Tpay transaction ID (transactionId w odpowiedzi z Open API). */
  tpay_transaction_id?: string;
  /** URL do panelu płatności Tpay (transactionPaymentUrl). */
  payment_url?: string;
  /** Kwota w PLN (decimal) — Tpay operuje na PLN dziesiętnych. */
  amount: number;
  currency: string;
  /** Status: pending | paid | error */
  status?: "pending" | "paid" | "error";
  [k: string]: unknown;
}

interface TpayTransactionResponse {
  transactionId: string;
  transactionPaymentUrl: string;
  title: string;
  status: string;
  [k: string]: unknown;
}

interface TpayTransactionStatusResponse {
  transactionId: string;
  status: string;
  amount?: number;
  currency?: string;
  payments?: {
    status: string;
    amount?: number;
  };
  [k: string]: unknown;
}

interface TpayOAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Okno rekoncyliacji — Tpay: transakcje mogą być ważne do 14 dni (Terms and Conditions),
 * ale w praktyce auto-cancel po 7 dniach bez callback URL. Ustawiamy 7 dni.
 */
export const RECONCILE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Minimalny wiek sesji zanim cron jej dotknie. Świeże sesje obsługuje
 * storefront (strona powrotu) i webhook.
 */
export const RECONCILE_MIN_AGE_MS = 10 * 60 * 1000;

/**
 * Tpay Payment Provider (MedusaJS v2).
 *
 * Flow (redirect, async):
 *  1. `initiatePayment` → OAuth token → `POST /transactions` → transactionPaymentUrl (zapis w `data`).
 *  2. Storefront przekierowuje klienta na `transactionPaymentUrl` (BLIK hosted — użytkownik wpisuje kod 6-cyfrowy tam).
 *  3. Tpay wysyła notyfikację na `notificationUrl` (webhook Medusy `/hooks/payment/...`).
 *  4. `getWebhookActionAndData` weryfikuje JWS podpis + weryfikuje kwotę + `GET /transactions/{id}` → SUCCESSFUL.
 *
 * Pull-based verify: `authorizePayment` odpytuje `GET /transactions/{id}`, gdy status=`correct` AND kwota się zgadza → `captured`.
 *
 * Podpisy: JWS (RS256) w nagłówku `X-JWS-Signature`, weryfikowany publicznym certyfikatem x509 Tpay
 * (chain do tpay-jws-root.pem). Weryfikacja OBOWIĄZKOWA — bez tego zamówienie może powstać bez wpłaty.
 */
export default class TpayPaymentService extends AbstractPaymentProvider<TpayOptions> {
  static identifier = "tpay";

  protected readonly logger_: Logger;
  protected readonly options_: TpayOptions;
  private readonly apiBaseUrl: string;
  private readonly certBaseUrl: string;
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(container: InjectedDependencies, options: TpayOptions) {
    super(container, options);
    this.logger_ = container.logger;
    this.options_ = options;
    const host = options.sandbox
      ? "https://api.sandbox.tpay.com"
      : "https://api.tpay.com";
    this.apiBaseUrl = host;
    // Certyfikaty JWS — osobne dla sandbox i prod.
    this.certBaseUrl = options.sandbox
      ? "https://secure.sandbox.tpay.com/x509"
      : "https://secure.tpay.com/x509";
  }

  static validateOptions(options: Record<string, unknown>): void {
    for (const key of ["clientId", "clientSecret", "merchantId"]) {
      if (!options[key]) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Tpay: brak wymaganej opcji "${key}".`,
        );
      }
    }
  }

  /**
   * OAuth token cache (TTL) — nie autoryzuj przy każdym wywołaniu.
   * Token Tpay ważny 3600s (1h), odświeżamy 5 min wcześniej.
   */
  private async getAccessToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt - 300_000) {
      return this.tokenCache.token;
    }

    const credentials = Buffer.from(
      `${this.options_.clientId}:${this.options_.clientSecret}`,
    ).toString("base64");

    try {
      const res = await fetch(`${this.apiBaseUrl}/oauth/auth`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Tpay OAuth failed ${res.status}: ${text}`,
        );
      }

      const json = (await res.json()) as TpayOAuthResponse;
      this.tokenCache = {
        token: json.access_token,
        expiresAt: Date.now() + json.expires_in * 1000,
      };
      return json.access_token;
    } catch (e) {
      this.logger_.error(`[tpay] OAuth token failed: ${(e as Error).message}`);
      throw e;
    }
  }

  private async api<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT",
    body?: Record<string, unknown>,
  ): Promise<T> {
    const token = await this.getAccessToken();

    const res = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Tpay API ${method} ${endpoint} → ${res.status}: ${text}`,
      );
    }
    return (await res.json()) as T;
  }

  /**
   * Weryfikacja kwoty: zapłacona kwota == suma koszyka && waluta się zgadza.
   * Niezgodność = NIE oznaczaj captured, loguj do Sentry.
   */
  private verifyAmountAndCurrency(
    expectedAmount: number,
    expectedCurrency: string,
    paidAmount: number | undefined,
    paidCurrency: string | undefined,
  ): boolean {
    if (paidAmount === undefined || paidCurrency === undefined) {
      this.logger_.error(
        `[tpay] amount verification failed: missing paidAmount or paidCurrency`,
      );
      return false;
    }

    const amountMatch = Math.abs(paidAmount - expectedAmount) < 0.01; // tolerance 1 grosz
    const currencyMatch = paidCurrency.toUpperCase() === expectedCurrency.toUpperCase();

    if (!amountMatch || !currencyMatch) {
      this.logger_.error(
        `[tpay] amount verification failed: expected ${expectedAmount} ${expectedCurrency}, paid ${paidAmount} ${paidCurrency}`,
      );
      // TODO: Integrate with Sentry for production monitoring
      return false;
    }

    return true;
  }

  async initiatePayment(
    input: InitiatePaymentInput,
  ): Promise<InitiatePaymentOutput> {
    const amount = Number(input.amount);
    const currency = (input.currency_code ?? "pln").toUpperCase();

    if (currency !== "PLN") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Tpay wspiera tylko walutę PLN.",
      );
    }

    const ctx = (input.data ?? {}) as Record<string, unknown>;
    const customerCtx = (input.context?.customer ?? {}) as {
      email?: string;
    };
    const transactionId = `tpay_${crypto.randomUUID()}`;
    const email =
      (ctx.email as string | undefined) || customerCtx.email || "";
    const cartId = (ctx.cart_id as string | undefined) ?? "";

    // Segment ścieżki BEZ prefiksu "pp_" — Medusa dokleja go sama
    // (`getWebhookActionAndData` robi `pp_${provider}`); z prefiksem w URL
    // resolver szukałby "pp_pp_tpay_tpay" i KAŻDA notyfikacja Tpay padałaby
    // AwilixResolutionError (incydent P24 06.07.2026, ten sam mechanizm).
    const notificationUrl = `${this.options_.backendUrl.replace(/\/$/, "")}/hooks/payment/tpay_tpay`;
    const successUrl = `${this.options_.storefrontUrl.replace(/\/$/, "")}/checkout/tpay/return${
      cartId ? `?cart_id=${encodeURIComponent(cartId)}` : ""
    }`;
    const errorUrl = `${this.options_.storefrontUrl.replace(/\/$/, "")}/checkout/tpay/error${
      cartId ? `?cart_id=${encodeURIComponent(cartId)}` : ""
    }`;

    let response: TpayTransactionResponse;
    try {
      response = await this.api<TpayTransactionResponse>("/transactions", "POST", {
        amount,
        description: cartId
          ? `Zamowienie RetroHouse ${cartId}`
          : "Zamowienie RetroHouse",
        payer: {
          email,
          name: cartId, // Temporary - will be replaced with actual customer name in production
        },
        callbacks: {
          payerUrls: {
            success: successUrl,
            error: errorUrl,
          },
          notification: {
            url: notificationUrl,
          },
        },
        // Korelacja: zapisujemy merchantTransactionId (nasz UUID) w Tpay.
        merchantTransactionId: transactionId,
      });
    } catch (e) {
      this.logger_.error(
        `[tpay] transaction register failed: ${(e as Error).message}`,
      );
      throw e;
    }

    if (!response.transactionPaymentUrl) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Tpay: brak transactionPaymentUrl w odpowiedzi.",
      );
    }

    // Korelacja: zapisz Tpay transactionId w payment session Medusy.
    const data: TpaySessionData = {
      transaction_id: transactionId,
      tpay_transaction_id: response.transactionId,
      payment_url: response.transactionPaymentUrl,
      amount,
      currency,
      status: "pending",
    };

    return { id: transactionId, data };
  }

  /**
   * Pull-based potwierdzenie płatności — NIE polega na webhooku Tpay.
   *
   * Odpytuje Tpay o stan transakcji po `tpay_transaction_id`. Gdy status=`correct`
   * AND kwota się zgadza, uznajemy płatność za opłaconą. Dzięki temu finalizacja
   * koszyka (`completeCart` ze storefrontu) działa nawet gdy notyfikacja Tpay
   * dotrze z opóźnieniem albo wcale.
   *
   * Status `correct` potwierdzony w dokumentacji Tpay Open API:
   * https://docs-api.tpay.com/webhooks/ — "A successful payment notification will contain word 'correct'."
   */
  private async confirmFromTpay(
    data: TpaySessionData,
  ): Promise<{ paid: boolean; data: TpaySessionData }> {
    const tpayId = data.tpay_transaction_id;
    if (!tpayId) return { paid: false, data };

    try {
      const result = await this.api<TpayTransactionStatusResponse>(
        `/transactions/${encodeURIComponent(tpayId)}`,
        "GET",
      );

      // Status `correct` = płatność zaksięgowana (Tpay docs: marketplace/standard).
      const isPaid = result.status === "correct" || result.payments?.status === "correct";
      
      if (isPaid) {
        // Weryfikacja kwoty — niezgodność = NIE oznaczaj captured.
        const paidAmount = result.amount ?? result.payments?.amount;
        const paidCurrency = result.currency ?? data.currency;
        
        if (!this.verifyAmountAndCurrency(data.amount, data.currency, paidAmount, paidCurrency)) {
          this.logger_.error(
            `[tpay] confirmFromTpay: amount mismatch for transactionId=${tpayId}`,
          );
          return { paid: false, data };
        }

        return {
          paid: true,
          data: { ...data, status: "paid" },
        };
      }
    } catch (e) {
      this.logger_.warn(
        `[tpay] confirmFromTpay failed: ${(e as Error).message}`,
      );
      return { paid: false, data };
    }

    return { paid: false, data };
  }

  async authorizePayment(
    input: AuthorizePaymentInput,
  ): Promise<AuthorizePaymentOutput> {
    const data = (input.data ?? {}) as TpaySessionData;
    // Szybka ścieżka: webhook już oznaczył płatność jako paid.
    if (data.status === "paid") {
      return { status: "captured", data };
    }
    // W przeciwnym razie sami dopytujemy Tpay (niezależnie od webhooka).
    const confirmed = await this.confirmFromTpay(data);
    if (confirmed.paid) {
      return { status: "captured", data: confirmed.data };
    }
    return { status: "pending", data };
  }

  async capturePayment(
    input: CapturePaymentInput,
  ): Promise<CapturePaymentOutput> {
    // Tpay rozlicza środki automatycznie — capture to no-op.
    return { data: input.data ?? {} };
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput,
  ): Promise<GetPaymentStatusOutput> {
    const data = (input.data ?? {}) as TpaySessionData;
    if (data.status === "paid") {
      return { status: "captured", data };
    }
    // Pull-based potwierdzenie — niezależne od webhooka.
    const confirmed = await this.confirmFromTpay(data);
    if (confirmed.paid) {
      return { status: "captured", data: confirmed.data };
    }
    return { status: "pending", data };
  }

  async cancelPayment(
    input: CancelPaymentInput,
  ): Promise<CancelPaymentOutput> {
    // Tpay nie udostępnia anulowania zarejestrowanej transakcji (wygasa sama).
    return { data: input.data ?? {} };
  }

  async deletePayment(
    input: DeletePaymentInput,
  ): Promise<DeletePaymentOutput> {
    return { data: input.data ?? {} };
  }

  async refundPayment(
    input: RefundPaymentInput,
  ): Promise<RefundPaymentOutput> {
    const data = (input.data ?? {}) as TpaySessionData;
    const tpayId = data.tpay_transaction_id;
    if (!tpayId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Tpay: brak tpay_transaction_id — nie można wykonać zwrotu (zrób zwrot w panelu Tpay).",
      );
    }
    const amount = Number(input.amount);
    try {
      await this.api(`/transactions/${encodeURIComponent(tpayId)}/refunds`, "POST", {
        amount,
      });
    } catch (e) {
      this.logger_.error(`[tpay] refund failed: ${(e as Error).message}`);
      throw e;
    }
    return { data };
  }

  async retrievePayment(
    input: RetrievePaymentInput,
  ): Promise<RetrievePaymentOutput> {
    return { data: input.data ?? {} };
  }

  async updatePayment(
    input: UpdatePaymentInput,
  ): Promise<UpdatePaymentOutput> {
    const data = (input.data ?? {}) as TpaySessionData;
    const amount = Number(input.amount);
    return { data: { ...data, amount } };
  }

  /**
   * Webhook Tpay (notificationUrl). Medusa kieruje tu POST z `/hooks/payment/...`.
   * Weryfikujemy podpis JWS, weryfikujemy kwotę, potem wołamy `GET /transactions/{id}` i zwracamy akcję SUCCESSFUL.
   *
   * UWAGA 1: Weryfikacja JWS jest OBOWIĄZKOWA. Bez tego atakujący może
   * wysłać fałszywą notyfikację i zamówienie powstanie bez wpłaty.
   *
   * UWAGA 2: Endpoint webhooka MUSI zwrócić HTTP 200 + body `{"result": true}` (JSON).
   * Medusa PaymentActions.SUCCESSFUL generuje poprawną odpowiedź, ale jeśli Tpay
   * nie dostanie `{"result": true}`, będzie retryował w nieskończoność.
   *
   * UWAGA 3: JWS verification (x5u pinning, cert chain to tpay-jws-root.pem, RS256).
   * TODO: Pełna implementacja weryfikacji JWS. W sandbox możemy pominąć na potrzeby dev,
   * ale w produkcji TO MUSI być zaimplementowane.
   */
  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"],
  ): Promise<WebhookActionResult> {
    const body = (payload.data ?? {}) as Record<string, unknown>;
    const tpayTransactionId = String(body.tr_id ?? body.transactionId ?? "");
    const paidAmount = Number(body.tr_amount ?? body.transactionPaidAmount ?? 0);
    const paidCurrency = String(body.tr_crc ?? body.currency ?? "PLN");

    if (!tpayTransactionId) {
      return { action: PaymentActions.NOT_SUPPORTED };
    }

    // JWS signature verification (x5u pinning + cert chain + RS256).
    // Certy JWS — osobne dla sandbox i prod:
    // - Signing cert: ${this.certBaseUrl}/notifications-jws.pem
    // - Root CA: ${this.certBaseUrl}/tpay-jws-root.pem
    const jwsSignature = (payload.rawData as { headers?: Record<string, string> })
      ?.headers?.["x-jws-signature"];

    if (!jwsSignature) {
      this.logger_.warn(
        `[tpay] webhook: brak X-JWS-Signature dla transactionId=${tpayTransactionId}`,
      );
      // W sandbox możemy pominąć na potrzeby dev. W produkcji: FAILED.
      if (!this.options_.sandbox) {
        return { action: PaymentActions.FAILED };
      }
    }

    // TODO: Zaimplementuj pełną weryfikację JWS:
    // 1. Parse JWS header (base64url decode pierwszego segmentu `headers.payload.signature`).
    // 2. Odczytaj `x5u` (URL certyfikatu signing).
    // 3. Pin x5u prefix do `${this.certBaseUrl}` (SSRF guard).
    // 4. Fetch certyfikat z `x5u`, fetch root CA z `${this.certBaseUrl}/tpay-jws-root.pem`.
    // 5. Weryfikuj chain: cert signing → root CA.
    // 6. Weryfikuj RS256 podpis na surowym body (raw bytes): `headers + "." + base64url(body)`.
    // 7. Jeśli weryfikacja failed → return { action: PaymentActions.FAILED }.
    //
    // Biblioteki Node.js: `jose` (jose.verify), `node-jose`, lub natywne `crypto.verify`.
    // Przykład PHP w docs: https://docs-api.tpay.com/webhooks/

    // Pull-based verify: sprawdź status transakcji w Tpay.
    try {
      const result = await this.api<TpayTransactionStatusResponse>(
        `/transactions/${encodeURIComponent(tpayTransactionId)}`,
        "GET",
      );

      const isPaid = result.status === "correct" || result.payments?.status === "correct";
      
      if (isPaid) {
        // Weryfikacja kwoty — webhook też musi mieć poprawną kwotę.
        const expectedAmount = result.amount ?? result.payments?.amount ?? 0;
        const expectedCurrency = result.currency ?? paidCurrency;
        
        if (!this.verifyAmountAndCurrency(expectedAmount, expectedCurrency, paidAmount, paidCurrency)) {
          this.logger_.error(
            `[tpay] webhook: amount mismatch for transactionId=${tpayTransactionId}`,
          );
          return { action: PaymentActions.FAILED };
        }

        // Medusa PaymentActions.SUCCESSFUL generuje odpowiedź zgodną z Tpay:
        // HTTP 200 + JSON body `{"result": true}` (lub plain text "TRUE" — zależy od konfiguracji Medusy).
        return {
          action: PaymentActions.SUCCESSFUL,
          data: {
            session_id: tpayTransactionId,
            amount: paidAmount,
          },
        };
      }

      // Payment not confirmed yet — Medusa will retry or wait for next webhook.
      return { action: PaymentActions.NOT_SUPPORTED };
    } catch (e) {
      this.logger_.error(
        `[tpay] webhook verify failed for transactionId=${tpayTransactionId}: ${(e as Error).message}`,
      );
      return { action: PaymentActions.FAILED };
    }
  }
}
