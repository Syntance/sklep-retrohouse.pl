import "server-only";
import { env } from "@/env";
import { getSessionToken } from "./session";

const BASE_URL = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, "");

/** Brak / wygasła sesja — strona ma przekierować na /magazyn/login. */
export class AdminUnauthorizedError extends Error {
	constructor(message = "Sesja wygasła. Zaloguj się ponownie.") {
		super(message);
		this.name = "AdminUnauthorizedError";
	}
}

/** Błąd zwrócony przez Medusa Admin API (z czytelnym komunikatem PL gdy się da). */
export class AdminApiError extends Error {
	readonly status: number;
	constructor(message: string, status: number) {
		super(message);
		this.name = "AdminApiError";
		this.status = status;
	}
}

function extractMessage(raw: string, fallback: string): string {
	try {
		const parsed = JSON.parse(raw) as { message?: string; type?: string };
		const message = parsed.message?.trim();
		if (parsed.type === "unknown_error") {
			return "Serwer mediów odrzucił plik. Spróbuj ponownie za chwilę.";
		}
		return message || fallback;
	} catch {
		return fallback;
	}
}

/** Logowanie email/hasło → token JWT admina Medusa. */
export async function loginWithEmailPassword(email: string, password: string): Promise<string> {
	const res = await fetch(`${BASE_URL}/auth/user/emailpass`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
		signal: AbortSignal.timeout(10_000),
	});

	if (res.status === 401) {
		throw new AdminUnauthorizedError("Nieprawidłowy email lub hasło.");
	}
	if (!res.ok) {
		const text = await res.text();
		throw new AdminApiError(extractMessage(text, "Logowanie nie powiodło się."), res.status);
	}

	const data = (await res.json()) as { token?: string };
	if (!data.token) {
		throw new AdminApiError("Brak tokenu w odpowiedzi serwera.", 500);
	}
	return data.token;
}

type AdminFetchInit = Omit<RequestInit, "body"> & { body?: string };

let cachedCatalogToken: { token: string; at: number } | null = null;

/** Token serwisowy do odczytu konfiguracji katalogu (epoki) w SSR — opcjonalny env. */
async function getCatalogAdminToken(): Promise<string | null> {
	const email = env.MEDUSA_ADMIN_EMAIL;
	const password = env.MEDUSA_ADMIN_PASSWORD;
	if (!email || !password) return null;

	if (cachedCatalogToken && Date.now() - cachedCatalogToken.at < 60 * 60 * 1000) {
		return cachedCatalogToken.token;
	}

	try {
		const token = await loginWithEmailPassword(email, password);
		cachedCatalogToken = { token, at: Date.now() };
		return token;
	} catch {
		return null;
	}
}

async function adminFetchWithToken<T>(
	token: string,
	path: string,
	init: AdminFetchInit = {},
): Promise<T> {
	const headers = new Headers(init.headers);
	headers.set("Authorization", `Bearer ${token}`);
	if (init.body) headers.set("Content-Type", "application/json");

	const res = await fetch(`${BASE_URL}${path}`, {
		...init,
		headers,
		cache: "no-store",
		signal: AbortSignal.timeout(15_000),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new AdminApiError(extractMessage(text, `Błąd ${res.status}.`), res.status);
	}
	if (res.status === 204) return undefined as T;
	return (await res.json()) as T;
}

/** Odczyt Admin API bez sesji panelu — storefront / server actions (MEDUSA_ADMIN_*). */
export async function catalogAdminFetch<T>(path: string, init: AdminFetchInit = {}): Promise<T | null> {
	const token = await getCatalogAdminToken();
	if (!token) return null;
	try {
		return await adminFetchWithToken<T>(token, path, init);
	} catch {
		return null;
	}
}

/** Zapis Admin API kontem serwisowym — np. licznik numerów spraw FK na storefront. */
export async function catalogAdminMutate<T>(path: string, init: AdminFetchInit = {}): Promise<T | null> {
	return catalogAdminFetch<T>(path, init);
}

/** Wywołanie Admin API z tokenem z sesji. Rzuca AdminUnauthorizedError przy 401. */
export async function adminFetch<T>(path: string, init: AdminFetchInit = {}): Promise<T> {
	const token = await getSessionToken();
	if (!token) throw new AdminUnauthorizedError();

	const headers = new Headers(init.headers);
	headers.set("Authorization", `Bearer ${token}`);
	if (init.body) headers.set("Content-Type", "application/json");

	const res = await fetch(`${BASE_URL}${path}`, {
		...init,
		headers,
		cache: "no-store",
		signal: AbortSignal.timeout(15_000),
	});

	if (res.status === 401) throw new AdminUnauthorizedError();
	if (!res.ok) {
		const text = await res.text();
		throw new AdminApiError(extractMessage(text, `Błąd ${res.status}.`), res.status);
	}
	if (res.status === 204) return undefined as T;
	return (await res.json()) as T;
}

/** Upload plików (multipart) — zwraca URL-e zapisane w Medusa. */
export async function adminUpload(files: File[]): Promise<string[]> {
	if (files.length === 0) return [];
	const token = await getSessionToken();
	if (!token) throw new AdminUnauthorizedError();

	const form = new FormData();
	for (const file of files) {
		const bytes = new Uint8Array(await file.arrayBuffer());
		const blob = new Blob([bytes], { type: file.type || "application/octet-stream" });
		form.append("files", blob, file.name || "upload.webp");
	}

	const res = await fetch(`${BASE_URL}/admin/uploads`, {
		method: "POST",
		headers: { Authorization: `Bearer ${token}` },
		body: form,
		signal: AbortSignal.timeout(60_000),
	});

	if (res.status === 401) throw new AdminUnauthorizedError();
	if (!res.ok) {
		const text = await res.text();
		throw new AdminApiError(extractMessage(text, "Upload nie powiódł się."), res.status);
	}

	const data = (await res.json()) as { files?: Array<{ url?: string }> };
	return (data.files ?? []).map((f) => f.url).filter((url): url is string => Boolean(url));
}

/** Token serwisowy (MEDUSA_ADMIN_EMAIL/PASSWORD) — do ISR-friendly fetch w module CMS. */
export async function getCmsServiceToken(): Promise<string | null> {
	return getCatalogAdminToken();
}

export { BASE_URL as MEDUSA_BASE_URL };
