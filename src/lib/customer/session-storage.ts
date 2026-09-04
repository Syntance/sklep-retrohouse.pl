/** Klucz sesji klienta (OTP) w localStorage — współdzielony navbar + /konto. */
const CUSTOMER_SESSION_STORAGE_KEY = "rh_customer_session";

export const CUSTOMER_SESSION_CHANGED_EVENT = "rh-customer-session-changed";

export function readCustomerToken(): string | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(CUSTOMER_SESSION_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { token?: string };
		return typeof parsed.token === "string" ? parsed.token : null;
	} catch {
		return null;
	}
}

export function writeCustomerToken(token: string): void {
	window.localStorage.setItem(
		CUSTOMER_SESSION_STORAGE_KEY,
		JSON.stringify({ token, savedAt: Date.now() }),
	);
	window.dispatchEvent(new Event(CUSTOMER_SESSION_CHANGED_EVENT));
}

export function clearCustomerToken(): void {
	window.localStorage.removeItem(CUSTOMER_SESSION_STORAGE_KEY);
	window.dispatchEvent(new Event(CUSTOMER_SESSION_CHANGED_EVENT));
}

function decodeTokenPayload(token: string): { email?: string; iat?: number } | null {
	try {
		const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
		const json =
			typeof atob === "function" ? atob(padded) : Buffer.from(token, "base64url").toString("utf8");
		return JSON.parse(json) as { email?: string; iat?: number };
	} catch {
		return null;
	}
}

/** E-mail z payloadu tokenu (tylko UI — autoryzacja po stronie API). */
export function getEmailFromCustomerToken(token: string): string | null {
	const payload = decodeTokenPayload(token);
	if (!payload) return null;
	if (!payload.email || typeof payload.iat !== "number") return null;
	if (Date.now() - payload.iat > 2 * 60 * 60 * 1000) return null;
	return payload.email;
}
