import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TpayPaymentService from "../src/modules/tpay/service";

type FetchMock = ReturnType<typeof vi.fn>;

const BASE_OPTIONS = {
  clientId: "test_client_id",
  clientSecret: "test_client_secret",
  merchantId: "123456",
  sandbox: true,
  backendUrl: "https://api.example.com",
  storefrontUrl: "https://shop.example.com",
};

const logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
} as {
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  debug: ReturnType<typeof vi.fn>;
};

function makeService(options: Partial<typeof BASE_OPTIONS> = {}) {
  return new TpayPaymentService(
    { logger } as never,
    { ...BASE_OPTIONS, ...options } as never,
  );
}

function mockFetchJsonOnce(fetchMock: FetchMock, body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response);
}

let fetchMock: FetchMock;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("OAuth token caching", () => {
  it("cache'uje token i nie wywołuje OAuth przy drugim requescie", async () => {
    // OAuth response
    mockFetchJsonOnce(fetchMock, {
      access_token: "tok_cached",
      token_type: "Bearer",
      expires_in: 3600,
    });
    // Transaction response
    mockFetchJsonOnce(fetchMock, {
      transactionId: "tr_1",
      transactionPaymentUrl: "https://secure.sandbox.tpay.com/...",
      title: "TEST",
      status: "pending",
    });

    const service = makeService();
    await service.initiatePayment({
      amount: 100,
      currency_code: "pln",
      data: { cart_id: "cart_1", email: "test@example.com" },
      context: {},
    } as never);

    expect(fetchMock).toHaveBeenCalledTimes(2); // OAuth + transaction

    // Drugi request — OAuth cache hit
    mockFetchJsonOnce(fetchMock, {
      transactionId: "tr_2",
      transactionPaymentUrl: "https://secure.sandbox.tpay.com/...",
      title: "TEST2",
      status: "pending",
    });

    await service.initiatePayment({
      amount: 200,
      currency_code: "pln",
      data: { cart_id: "cart_2", email: "test@example.com" },
      context: {},
    } as never);

    expect(fetchMock).toHaveBeenCalledTimes(3); // tylko transaction (OAuth cached)
  });
});

describe("initiatePayment — rejestracja transakcji", () => {
  it("wysyła POST /transactions z merchantTransactionId (korelacja)", async () => {
    mockFetchJsonOnce(fetchMock, {
      access_token: "tok_abc",
      token_type: "Bearer",
      expires_in: 3600,
    });
    mockFetchJsonOnce(fetchMock, {
      transactionId: "01K5XYZ",
      transactionPaymentUrl: "https://secure.sandbox.tpay.com/tr/tok_xyz",
      title: "TR-TEST",
      status: "pending",
    });

    const service = makeService();
    const result = await service.initiatePayment({
      amount: 179.9,
      currency_code: "pln",
      data: { cart_id: "cart_1", email: "client@example.com" },
      context: {},
    } as never);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [, transactionCall] = fetchMock.mock.calls;
    const [url, init] = transactionCall as [string, RequestInit];
    expect(url).toBe("https://api.sandbox.tpay.com/transactions");
    const body = JSON.parse(String(init.body));
    expect(body.amount).toBe(179.9);
    expect(body.merchantTransactionId).toMatch(/^tpay_[0-9a-f-]{36}$/);
    expect(body.callbacks.notification.url).toBe(
      "https://api.example.com/hooks/payment/tpay_tpay",
    );

    const data = result.data as Record<string, unknown>;
    expect(data.tpay_transaction_id).toBe("01K5XYZ");
    expect(data.payment_url).toBe("https://secure.sandbox.tpay.com/tr/tok_xyz");
    expect(data.status).toBe("pending");
    expect(data.amount).toBe(179.9);
    expect(data.currency).toBe("PLN");
  });

  it("rzuca gdy waluta != PLN", async () => {
    const service = makeService();
    await expect(
      service.initiatePayment({
        amount: 100,
        currency_code: "eur",
        data: {},
        context: {},
      } as never),
    ).rejects.toThrow(/tylko walutę PLN/i);
  });

  it("rzuca gdy Tpay nie zwróci transactionPaymentUrl", async () => {
    mockFetchJsonOnce(fetchMock, { access_token: "tok", token_type: "Bearer", expires_in: 3600 });
    mockFetchJsonOnce(fetchMock, { transactionId: "tr_1", title: "TEST" }); // brak URL

    const service = makeService();
    await expect(
      service.initiatePayment({
        amount: 10,
        currency_code: "pln",
        data: {},
        context: {},
      } as never),
    ).rejects.toThrow(/brak transactionPaymentUrl/i);
  });
});

describe("authorizePayment — pull-based potwierdzenie + weryfikacja kwoty", () => {
  it("zwraca captured bez odpytywania Tpay, gdy status=paid", async () => {
    const service = makeService();
    const result = await service.authorizePayment({
      data: {
        transaction_id: "tpay_1",
        tpay_transaction_id: "tr_1",
        status: "paid",
        amount: 100,
        currency: "PLN",
      },
    } as never);

    expect(result.status).toBe("captured");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("status=correct w Tpay + kwota OK → captured", async () => {
    mockFetchJsonOnce(fetchMock, { access_token: "tok", token_type: "Bearer", expires_in: 3600 });
    mockFetchJsonOnce(fetchMock, {
      transactionId: "tr_2",
      status: "correct",
      amount: 100,
      currency: "PLN",
    });

    const service = makeService();
    const result = await service.authorizePayment({
      data: {
        transaction_id: "tpay_2",
        tpay_transaction_id: "tr_2",
        status: "pending",
        amount: 100,
        currency: "PLN",
      },
    } as never);

    expect(result.status).toBe("captured");
    expect((result.data as Record<string, unknown>).status).toBe("paid");
  });

  it("status=correct ale KWOTA NIEZGODNA → pending (nie captured)", async () => {
    mockFetchJsonOnce(fetchMock, { access_token: "tok", token_type: "Bearer", expires_in: 3600 });
    mockFetchJsonOnce(fetchMock, {
      transactionId: "tr_3",
      status: "correct",
      amount: 100, // Tpay zwraca 100
      currency: "PLN",
    });

    const service = makeService();
    const result = await service.authorizePayment({
      data: {
        transaction_id: "tpay_3",
        tpay_transaction_id: "tr_3",
        status: "pending",
        amount: 150, // oczekujemy 150 — NIEZGODNOŚĆ
        currency: "PLN",
      },
    } as never);

    expect(result.status).toBe("pending"); // NIE captured
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("amount verification failed"),
    );
  });

  it("status=correct ale WALUTA NIEZGODNA → pending", async () => {
    mockFetchJsonOnce(fetchMock, { access_token: "tok", token_type: "Bearer", expires_in: 3600 });
    mockFetchJsonOnce(fetchMock, {
      transactionId: "tr_4",
      status: "correct",
      amount: 100,
      currency: "EUR", // Tpay zwraca EUR (błąd w testach)
    });

    const service = makeService();
    const result = await service.authorizePayment({
      data: {
        transaction_id: "tpay_4",
        tpay_transaction_id: "tr_4",
        status: "pending",
        amount: 100,
        currency: "PLN", // oczekujemy PLN
      },
    } as never);

    expect(result.status).toBe("pending");
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("amount verification failed"),
    );
  });

  it("nieopłacona transakcja → pending (zamówienie NIE powstanie)", async () => {
    mockFetchJsonOnce(fetchMock, { access_token: "tok", token_type: "Bearer", expires_in: 3600 });
    mockFetchJsonOnce(fetchMock, {
      transactionId: "tr_5",
      status: "pending", // jeszcze niepaid
      amount: 100,
      currency: "PLN",
    });

    const service = makeService();
    const result = await service.authorizePayment({
      data: {
        transaction_id: "tpay_5",
        tpay_transaction_id: "tr_5",
        status: "pending",
        amount: 100,
        currency: "PLN",
      },
    } as never);

    expect(result.status).toBe("pending");
  });

  it("błąd sieci przy odpytaniu Tpay → pending (bez crasha, retry następnym razem)", async () => {
    mockFetchJsonOnce(fetchMock, { access_token: "tok", token_type: "Bearer", expires_in: 3600 });
    fetchMock.mockRejectedValueOnce(new Error("ETIMEDOUT"));

    const service = makeService();
    const result = await service.authorizePayment({
      data: {
        transaction_id: "tpay_6",
        tpay_transaction_id: "tr_6",
        status: "pending",
        amount: 100,
        currency: "PLN",
      },
    } as never);

    expect(result.status).toBe("pending");
  });
});

describe("getWebhookActionAndData — webhook Tpay + weryfikacja kwoty", () => {
  it("status=correct + kwota OK → SUCCESSFUL", async () => {
    mockFetchJsonOnce(fetchMock, { access_token: "tok", token_type: "Bearer", expires_in: 3600 });
    mockFetchJsonOnce(fetchMock, {
      transactionId: "tr_hook_1",
      status: "correct",
      amount: 179.9,
      currency: "PLN",
    });

    const service = makeService();
    const result = await service.getWebhookActionAndData({
      data: {
        transactionId: "tr_hook_1",
        transactionPaidAmount: 179.9,
        currency: "PLN",
      },
      rawData: {
        headers: { "x-jws-signature": "fake_jws_signature_for_test" },
      },
    } as never);

    expect(result.action).toBe("captured");
    expect(fetchMock).toHaveBeenCalledTimes(2); // OAuth + GET /transactions
  });

  it("status=correct ale KWOTA NIEZGODNA → FAILED", async () => {
    mockFetchJsonOnce(fetchMock, { access_token: "tok", token_type: "Bearer", expires_in: 3600 });
    mockFetchJsonOnce(fetchMock, {
      transactionId: "tr_hook_2",
      status: "correct",
      amount: 100, // Tpay potwierdza 100
      currency: "PLN",
    });

    const service = makeService();
    const result = await service.getWebhookActionAndData({
      data: {
        transactionId: "tr_hook_2",
        transactionPaidAmount: 150, // webhook twierdzi 150 — NIEZGODNOŚĆ
        currency: "PLN",
      },
      rawData: { headers: { "x-jws-signature": "fake" } },
    } as never);

    expect(result.action).toBe("failed");
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("webhook: amount mismatch"),
    );
  });

  it("brak transactionId → NOT_SUPPORTED", async () => {
    const service = makeService();
    const result = await service.getWebhookActionAndData({
      data: { foo: "bar" },
      rawData: {},
    } as never);

    expect(result.action).toBe("not_supported");
  });

  it("brak X-JWS-Signature w sandbox → WARN ale proceed (dev mode)", async () => {
    mockFetchJsonOnce(fetchMock, { access_token: "tok", token_type: "Bearer", expires_in: 3600 });
    mockFetchJsonOnce(fetchMock, {
      transactionId: "tr_hook_3",
      status: "correct",
      amount: 50,
      currency: "PLN",
    });

    const service = makeService({ sandbox: true });
    const result = await service.getWebhookActionAndData({
      data: {
        transactionId: "tr_hook_3",
        transactionPaidAmount: 50,
        currency: "PLN",
      },
      rawData: { headers: {} }, // brak X-JWS-Signature
    } as never);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("brak X-JWS-Signature"),
    );
    expect(result.action).toBe("captured"); // sandbox toleruje
  });

  it("brak X-JWS-Signature w production → FAILED", async () => {
    const service = makeService({ sandbox: false });
    const result = await service.getWebhookActionAndData({
      data: {
        transactionId: "tr_hook_4",
        transactionPaidAmount: 100,
        currency: "PLN",
      },
      rawData: { headers: {} },
    } as never);

    expect(result.action).toBe("failed");
  });
});
