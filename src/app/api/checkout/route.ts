import { NextResponse } from "next/server";
import { createMedusaOrder } from "@/lib/checkout/create-order";
import { sendNewOrderShopNotification, sendOrderStatusEmail } from "@/lib/email/order-status-email";
import { CheckoutSchema } from "@/lib/validation/checkout";

/**
 * POST /api/checkout — tworzy realne zamówienie w Medusa (płatność testowa/manualna).
 * Body JSON zgodne z CheckoutSchema. Zwraca { ok, orderId, displayId } lub błąd.
 */
export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ ok: false, error: "Nieprawidłowe dane." }, { status: 400 });
	}

	const parsed = CheckoutSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ ok: false, error: parsed.error.issues[0]?.message ?? "Błędne dane formularza." },
			{ status: 400 },
		);
	}

	try {
		const result = await createMedusaOrder(parsed.data);
		if (!result.ok) {
			return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
		}
		await Promise.all([
			sendOrderStatusEmail(result.orderId, "placed"),
			sendNewOrderShopNotification(result.orderId),
		]);

		return NextResponse.json({
			ok: true,
			orderId: result.orderId,
			displayId: result.displayId,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Błąd serwera.";
		return NextResponse.json({ ok: false, error: message }, { status: 500 });
	}
}
