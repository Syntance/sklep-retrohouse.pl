import { type NextRequest, NextResponse } from "next/server";
import { MEDUSA_BASE_URL } from "@/lib/admin/medusa-admin";
import { setSessionToken } from "@/lib/admin/session";

/**
 * Callback OAuth Google → wymiana code na token Medusa i zapis sesji.
 * Działa po skonfigurowaniu providera google w backendzie Medusa.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
	const { searchParams, origin } = request.nextUrl;
	const loginUrl = new URL("/magazyn/login", origin);
	const dashboardUrl = new URL("/magazyn", origin);

	const directToken = searchParams.get("token");
	if (directToken) {
		await setSessionToken(directToken);
		return NextResponse.redirect(dashboardUrl);
	}

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
			if (data.token) {
				await setSessionToken(data.token);
				return NextResponse.redirect(dashboardUrl);
			}
		}
	} catch {
		// fall through to error redirect
	}

	loginUrl.searchParams.set("error", "google");
	return NextResponse.redirect(loginUrl);
}
