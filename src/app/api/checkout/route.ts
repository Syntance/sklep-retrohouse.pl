import { NextResponse } from "next/server";
import { createMedusaOrder } from "@/lib/checkout/create-order";
import { sendNewOrderShopNotification, sendOrderStatusEmail } from "@/lib/email/order-status-email";
import { rateLimit } from "@/lib/rate-limit";
import { CheckoutSchema } from "@/lib/validation/checkout";

/**
 * POST /api/checkout — tworzy realne zamówienie w Medusa (płatność testowa/manualna).
 * Body JSON zgodne z CheckoutSchema. Zwraca { ok, orderId, displayId } lub błąd.
 */
export async function POST(request: Request) {
	// Endpoint jest publiczny i tworzy REALNE zamówienia; bez limitu daje też
	// wyrocznię do zgadywania kodów rabatowych (inny komunikat dla kodu
	// istniejącego i nieistniejącego).
	const ip =
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		request.headers.get("x-real-ip")?.trim() ||
		"anonymous";
	const limit = rateLimit(`checkout:${ip}`, 10, 10 * 60_000);
	if (!limit.ok) {
		return NextResponse.json(
			{ ok: false, error: "Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie." },
			{ status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
		);
	}

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

		// Zamówienie JUŻ istnieje — awaria maila nie może zamienić sukcesu w błąd.
		// Wcześniej rzucony mail leciał do catch → klient widział "nie udało się"
		// i ponawiał, tworząc drugie realne zamówienie.
		const mailResults = await Promise.allSettled([
			sendOrderStatusEmail(result.orderId, "placed"),
			sendNewOrderShopNotification(result.orderId),
		]);
		for (const outcome of mailResults) {
			if (outcome.status === "rejected") {
				console.error("[checkout] order created, e-mail failed", result.orderId, outcome.reason);
			}
		}

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
