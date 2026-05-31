import { type NextRequest, NextResponse } from "next/server";
import { clearSessionToken } from "@/lib/admin/session";

/** Czyści sesję i wraca na login — używane przy wygasłym tokenie. */
export async function GET(request: NextRequest): Promise<NextResponse> {
	await clearSessionToken();
	return NextResponse.redirect(new URL("/magazyn/login", request.nextUrl.origin));
}
