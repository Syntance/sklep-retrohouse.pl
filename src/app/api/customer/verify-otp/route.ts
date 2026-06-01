import { NextResponse } from "next/server";
import { CustomerVerifyOtpSchema } from "@/lib/validation/returns";
import { createCustomerToken, verifyOtp } from "@/lib/customer/auth";

/**
 * POST /api/customer/verify-otp
 * Weryfikuje kod OTP i zwraca token sesji.
 */
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = CustomerVerifyOtpSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ ok: false, error: "Niepoprawny format danych" },
				{ status: 400 },
			);
		}

		const { email, code } = parsed.data;
		const isValid = verifyOtp(email, code);

		if (!isValid) {
			return NextResponse.json(
				{ ok: false, error: "Niepoprawny kod lub wygasł" },
				{ status: 401 },
			);
		}

		const token = createCustomerToken(email);

		return NextResponse.json({ ok: true, token });
	} catch (error) {
		console.error("OTP verify error:", error);
		return NextResponse.json(
			{ ok: false, error: "Błąd weryfikacji" },
			{ status: 500 },
		);
	}
}
