import "server-only";
import crypto from "node:crypto";

/** In-memory storage dla OTP (production: Redis / Upstash). */
const otpStore = new Map<string, { code: string; expiresAt: number }>();

/**
 * Generuje 6-cyfrowy OTP i zapisuje na 15 min.
 * @returns kod OTP (wysyłany mailem)
 */
export function generateOtp(email: string): string {
	const code = crypto.randomInt(100000, 999999).toString();
	const expiresAt = Date.now() + 15 * 60 * 1000; // 15 min
	otpStore.set(email.toLowerCase(), { code, expiresAt });
	console.log(`[generateOtp] Generated code for ${email.toLowerCase()}: ${code}, expires at ${new Date(expiresAt).toISOString()}`);
	return code;
}

/**
 * Weryfikuje OTP dla danego emaila.
 * @returns true jeśli poprawny i ważny
 */
export function verifyOtp(email: string, code: string): boolean {
	const stored = otpStore.get(email.toLowerCase());
	console.log(`[verifyOtp] Checking email: ${email.toLowerCase()}, code: ${code}`);
	console.log(`[verifyOtp] Stored:`, stored);
	
	if (!stored) {
		console.log(`[verifyOtp] No OTP found for ${email.toLowerCase()}`);
		return false;
	}
	
	if (Date.now() > stored.expiresAt) {
		console.log(`[verifyOtp] OTP expired for ${email.toLowerCase()}`);
		otpStore.delete(email.toLowerCase());
		return false;
	}
	
	if (stored.code !== code) {
		console.log(`[verifyOtp] Code mismatch. Expected: ${stored.code}, Got: ${code}`);
		return false;
	}

	// Usuwamy po poprawnej weryfikacji (one-time)
	console.log(`[verifyOtp] OTP verified successfully for ${email.toLowerCase()}`);
	otpStore.delete(email.toLowerCase());
	return true;
}

/**
 * Tworzy JWT token dla zalogowanego klienta (sesja 2h).
 * @param email email klienta
 * @returns signed JWT
 */
export function createCustomerToken(email: string): string {
	// Uproszczona wersja - w produkcji użyj jose/jsonwebtoken + secret z env
	const payload = { email: email.toLowerCase(), iat: Date.now() };
	return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

/**
 * Weryfikuje token klienta.
 * @returns email jeśli ważny, null jeśli nieważny/wygasły
 */
export function verifyCustomerToken(token: string): string | null {
	try {
		const payload = JSON.parse(Buffer.from(token, "base64url").toString());
		const age = Date.now() - payload.iat;
		if (age > 2 * 60 * 60 * 1000) return null; // 2h
		return payload.email;
	} catch {
		return null;
	}
}
