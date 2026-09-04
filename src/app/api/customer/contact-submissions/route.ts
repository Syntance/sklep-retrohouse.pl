import { NextResponse } from "next/server";
import { listContactSubmissionsForEmail } from "@/lib/admin/contact-submissions";
import { verifyCustomerToken } from "@/lib/customer/auth";

export async function GET(request: Request) {
	try {
		const authHeader = request.headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json({ ok: false, error: "Brak tokenu autoryzacji" }, { status: 401 });
		}

		const email = verifyCustomerToken(authHeader.slice(7));
		if (!email) {
			return NextResponse.json(
				{ ok: false, error: "Token wygasł lub jest niepoprawny" },
				{ status: 401 },
			);
		}

		const submissions = await listContactSubmissionsForEmail(email);
		return NextResponse.json({ ok: true, submissions });
	} catch {
		return NextResponse.json(
			{ ok: false, error: "Nie udało się pobrać formularzy" },
			{ status: 500 },
		);
	}
}
