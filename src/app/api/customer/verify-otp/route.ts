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
		console.log("[verify-otp] Received body:", body);
		
		const parsed = CustomerVerifyOtpSchema.safeParse(body);

		if (!parsed.success) {
			console.log("[verify-otp] Validation failed:", parsed.error);
			return NextResponse.json(
				{ ok: false, error: "Niepoprawny format danych" },
				{ status: 400 },
			);
		}

		const { email, code } = parsed.data;
		console.log("[verify-otp] Verifying email:", email, "code:", code);
		
		const isValid = verifyOtp(email, code);
		console.log("[verify-otp] Verification result:", isValid);

		if (!isValid) {
			return NextResponse.json(
				{ ok: false, error: "Niepoprawny kod lub wygasł" },
				{ status: 401 },
			);
		}

		const token = createCustomerToken(email);

		return NextResponse.json({ ok: true, token });
	} catch (error) {
		console.error("[verify-otp] Error:", error);
		return NextResponse.json(
			{ ok: false, error: "Błąd weryfikacji" },
			{ status: 500 },
		);
	}
}
