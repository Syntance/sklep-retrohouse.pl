import { NextResponse } from "next/server";
import { createMedusaOrder } from "@/lib/checkout/create-order";
import { sendNewOrderShopNotification, sendOrderStatusEmail } from "@/lib/email/order-status-email";
import { CheckoutSchema } from "@/lib/validation/checkout";

const completedRequests = new Map<string, { timestamp: number; response: unknown }>();
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000;

function pruneIdempotencyCache(now: number): void {
	if (completedRequests.size <= 1000) return;
	for (const [key, value] of completedRequests.entries()) {
		if (now - value.timestamp > IDEMPOTENCY_TTL) {
			completedRequests.delete(key);
		}
	}
}

/**
 * POST /api/checkout — tworzy zamówienie w Medusa lub redirect do Tpay.
 * Body JSON zgodne z CheckoutSchema. Obsługuje X-Idempotency-Key.
 */
export async function POST(request: Request) {
	const idempotencyKey = request.headers.get("x-idempotency-key");

	if (idempotencyKey) {
		const cached = completedRequests.get(idempotencyKey);
		if (cached && Date.now() - cached.timestamp < IDEMPOTENCY_TTL) {
			return NextResponse.json(cached.response);
		}
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

		if ("redirectUrl" in result) {
			const responseData = {
				ok: true,
				redirect: true,
				url: result.redirectUrl,
				cartId: result.cartId,
			};

			if (idempotencyKey) {
				const now = Date.now();
				completedRequests.set(idempotencyKey, { timestamp: now, response: responseData });
				pruneIdempotencyCache(now);
			}

			return NextResponse.json(responseData);
		}

		await Promise.all([
			sendOrderStatusEmail(result.orderId, "placed"),
			sendNewOrderShopNotification(result.orderId),
		]);

		const responseData = {
			ok: true,
			orderId: result.orderId,
			displayId: result.displayId,
		};

		if (idempotencyKey) {
			const now = Date.now();
			completedRequests.set(idempotencyKey, { timestamp: now, response: responseData });
			pruneIdempotencyCache(now);
		}

		return NextResponse.json(responseData);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Błąd serwera.";
		return NextResponse.json({ ok: false, error: message }, { status: 500 });
	}
}
