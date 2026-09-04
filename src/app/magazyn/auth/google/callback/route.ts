import { type NextRequest, NextResponse } from "next/server";
import { isAdminEmailAllowed } from "@/lib/admin/allowlist";
import { MEDUSA_BASE_URL } from "@/lib/admin/medusa-admin";
import { setSessionToken } from "@/lib/admin/session";

/**
 * Callback OAuth Google → wymiana code na token Medusa i zapis sesji.
 * Działa po skonfigurowaniu providera google w backendzie Medusa.
 *
 * SECURITY: NIE akceptujemy tokenu z query (`?token=`). Wcześniej callback
 * zapisywał dowolny token z URL jako sesję bez weryfikacji — to pozwalało
 * ominąć allowlistę i rate-limit (wystarczyło zdobyć token z publicznego
 * /auth/user/emailpass), a także podmienić sesję zalogowanemu adminowi
 * (session fixation przez zwykły link). Jedyna droga to wymiana code↔token
 * server-to-server z backendem Medusa (poniżej).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
	const { searchParams, origin } = request.nextUrl;
	const loginUrl = new URL("/magazyn/login", origin);
	const dashboardUrl = new URL("/magazyn", origin);

	const query = searchParams.toString();
	if (!query) {
		loginUrl.searchParams.set("error", "google");
		return NextResponse.redirect(loginUrl);
	}

	try {
		const res = await fetch(`${MEDUSA_BASE_URL}/auth/user/google/callback?${query}`, {
			method: "GET",
			signal: AbortSignal.timeout(10_000),
		});
		if (res.ok) {
			const data = (await res.json()) as { token?: string };
			if (data.token && (await isTokenOnAllowlist(data.token))) {
				await setSessionToken(data.token);
				return NextResponse.redirect(dashboardUrl);
			}
			if (data.token) {
				// Konto poprawnie uwierzytelnione w Medusie, ale spoza allowlisty.
				loginUrl.searchParams.set("error", "forbidden");
				return NextResponse.redirect(loginUrl);
			}
		}
	} catch {
		// fall through to error redirect
	}

	loginUrl.searchParams.set("error", "google");
	return NextResponse.redirect(loginUrl);
}

/**
 * Allowlista musi obowiązywać na KAŻDEJ ścieżce logowania, nie tylko
 * email+hasło — inaczej Google jest cichym obejściem kontroli dostępu.
 * Pytamy Medusę o tożsamość stojącą za świeżo wydanym tokenem.
 */
async function isTokenOnAllowlist(token: string): Promise<boolean> {
	try {
		const res = await fetch(`${MEDUSA_BASE_URL}/admin/users/me?fields=id,email`, {
			headers: { Authorization: `Bearer ${token}` },
			signal: AbortSignal.timeout(10_000),
		});
		if (!res.ok) return false;
		const data = (await res.json()) as { user?: { email?: string } };
		return isAdminEmailAllowed(data.user?.email);
	} catch {
		return false;
	}
}
