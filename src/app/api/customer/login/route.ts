import { NextResponse } from "next/server";
import { CustomerLoginSchema } from "@/lib/validation/returns";
import { generateOtp } from "@/lib/customer/auth";
import {
	sendTransactionalEmail,
	type SendEmailInput,
} from "@/lib/email/send-transactional";

/**
 * POST /api/customer/login
 * Wysyła kod OTP na email klienta (logowanie bez hasła).
 */
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = CustomerLoginSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ ok: false, error: "Niepoprawny adres email" },
				{ status: 400 },
			);
		}

		const { email } = parsed.data;
		const code = generateOtp(email);

		// Wyślij email z kodem OTP
		await sendTransactionalEmail({
			to: email,
			subject: "Twój kod do logowania — RetroHouse",
			text: `Twój kod: ${code}\n\nKod jest ważny przez 15 minut.\n\nJeśli nie prosiłeś o ten kod, zignoruj tę wiadomość.`,
			html: `
				<div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
					<h2 style="color: #2D1810; margin-bottom: 16px;">Twój kod do logowania</h2>
					<div style="background: #F5EFE7; border-radius: 8px; padding: 16px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #7D5A3C; margin: 24px 0;">
						${code}
					</div>
					<p style="color: #666; font-size: 14px;">Kod jest ważny przez 15 minut.</p>
					<p style="color: #666; font-size: 14px;">Jeśli nie prosiłeś o ten kod, zignoruj tę wiadomość.</p>
				</div>
			`,
		});

		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("Customer login error:", error);
		return NextResponse.json(
			{ ok: false, error: "Nie udało się wysłać kodu" },
			{ status: 500 },
		);
	}
}
