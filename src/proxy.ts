import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin/session";

/**
 * Ochrona dashboardu /magazyn — wpuszcza tylko z aktywną sesją (cookie).
 * Optimistic check: właściwa weryfikacja tokenu dzieje się przy fetchu do Medusa.
 */
export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isPublic =
		pathname === "/magazyn/login" || pathname.startsWith("/magazyn/auth/");
	if (isPublic) return NextResponse.next();

	const hasSession = Boolean(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
	if (!hasSession) {
		const loginUrl = new URL("/magazyn/login", request.url);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/magazyn/:path*"],
};
