import "server-only";
import { cookies } from "next/headers";

/** Cookie z tokenem JWT admina Medusa (sesja dashboardu /magazyn). */
export const ADMIN_COOKIE_NAME = "rh_admin_session";

const MAX_AGE_SECONDS = 60 * 60 * 24; // Medusa JWT ~24h

export async function getSessionToken(): Promise<string | null> {
	const store = await cookies();
	return store.get(ADMIN_COOKIE_NAME)?.value ?? null;
}

export async function setSessionToken(token: string): Promise<void> {
	const store = await cookies();
	store.set(ADMIN_COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: MAX_AGE_SECONDS,
	});
}

export async function clearSessionToken(): Promise<void> {
	const store = await cookies();
	store.delete(ADMIN_COOKIE_NAME);
}
