import { NextResponse } from "next/server";
import { verifyCustomerToken } from "@/lib/customer/auth";
import { getCustomerOrders } from "@/lib/customer/orders";

/**
 * GET /api/customer/orders
 * Pobiera zamówienia dla zalogowanego klienta.
 * Wymaga tokenu w Authorization: Bearer <token>
 */
export async function GET(request: Request) {
	try {
		const authHeader = request.headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json({ ok: false, error: "Brak tokenu autoryzacji" }, { status: 401 });
		}

		const token = authHeader.slice(7);
		const email = verifyCustomerToken(token);

		if (!email) {
			return NextResponse.json(
				{ ok: false, error: "Token wygasł lub jest niepoprawny" },
				{ status: 401 },
			);
		}

		const orders = await getCustomerOrders(email);

		return NextResponse.json({ ok: true, orders });
	} catch (error) {
		console.error("[GET /api/customer/orders] Error:", error);
		return NextResponse.json(
			{ ok: false, error: "Nie udało się pobrać zamówień" },
			{ status: 500 },
		);
	}
}
