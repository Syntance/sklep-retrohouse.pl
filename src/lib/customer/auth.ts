import "server-only";
import crypto from "node:crypto";
import { env } from "@/env";

/** In-memory storage dla OTP (production: Redis / Upstash). */
const otpStore = new Map<string, { code: string; expiresAt: number }>();

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2h
const OTP_TTL_MS = 15 * 60 * 1000; // 15 min

/**
 * Sekret HMAC dla tokenów sesji klienta.
 * Produkcja: wymagany `CUSTOMER_SESSION_SECRET` (fail-closed — bez sekretu logowanie nie działa).
 * Dev/test: stały sekret, żeby lokalny flow OTP działał bez konfiguracji.
 */
function getSessionSecret(): string {
	if (env.CUSTOMER_SESSION_SECRET) return env.CUSTOMER_SESSION_SECRET;
	if (env.NODE_ENV === "production") {
		throw new Error(
			"CUSTOMER_SESSION_SECRET jest wymagany na produkcji — bez podpisu HMAC token sesji klienta dałby się sfałszować.",
		);
	}
	return "dev-only-insecure-customer-session-secret";
}

function sign(payloadB64: string): string {
	return crypto.createHmac("sha256", getSessionSecret()).update(payloadB64).digest("base64url");
}

/**
 * Generuje 6-cyfrowy OTP i zapisuje na 15 min.
 * Kod trafia WYŁĄCZNIE do e-maila klienta — nigdy do logów.
 * @returns kod OTP (wysyłany e-mailem)
 */
export function generateOtp(email: string): string {
	const code = crypto.randomInt(100000, 999999).toString();
	otpStore.set(email.toLowerCase(), { code, expiresAt: Date.now() + OTP_TTL_MS });
	return code;
}

/**
 * Weryfikuje OTP dla danego emaila (one-time — poprawny kod jest kasowany).
 * @returns true jeśli poprawny i ważny
 */
export function verifyOtp(email: string, code: string): boolean {
	const key = email.toLowerCase();
	const stored = otpStore.get(key);
	if (!stored) return false;

	if (Date.now() > stored.expiresAt) {
		otpStore.delete(key);
		return false;
	}

	const expected = Buffer.from(stored.code);
	const provided = Buffer.from(code);
	if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
		return false;
	}

	otpStore.delete(key);
	return true;
}

/**
 * Tworzy podpisany token sesji klienta (HMAC-SHA256, ważny 2h).
 * Format: base64url(payload) + "." + base64url(hmac).
 */
export function createCustomerToken(email: string): string {
	const payloadB64 = Buffer.from(
		JSON.stringify({ email: email.toLowerCase(), iat: Date.now() }),
	).toString("base64url");
	return `${payloadB64}.${sign(payloadB64)}`;
}

/**
 * Weryfikuje token klienta: podpis HMAC (timing-safe) + TTL 2h.
 * @returns email jeśli ważny, null jeśli nieważny/wygasły/sfałszowany
 */
export function verifyCustomerToken(token: string): string | null {
	try {
		const [payloadB64, signature] = token.split(".");
		if (!payloadB64 || !signature) return null;

		const expected = Buffer.from(sign(payloadB64));
		const provided = Buffer.from(signature);
		if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
			return null;
		}

		const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
		if (typeof payload.email !== "string" || typeof payload.iat !== "number") return null;
		if (Date.now() - payload.iat > SESSION_TTL_MS) return null;
		return payload.email;
	} catch {
		return null;
	}
}
