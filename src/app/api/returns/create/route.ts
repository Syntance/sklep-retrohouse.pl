import { NextResponse } from "next/server";
import { CreateReturnSchema } from "@/lib/validation/returns";
import { verifyCustomerToken } from "@/lib/customer/auth";
import { createReturnRequest } from "@/lib/admin/returns";
import { sendTransactionalEmail } from "@/lib/email/send-transactional";
import { EMAIL_CONTACT } from "@/lib/email/constants";

/**
 * POST /api/returns/create
 * Tworzy wniosek o zwrot/odstąpienie od umowy.
 * Wymaga tokenu klienta.
 */
export async function POST(request: Request) {
	try {
		const authHeader = request.headers.get("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json(
				{ ok: false, error: "Brak autoryzacji" },
				{ status: 401 },
			);
		}

		const token = authHeader.slice(7);
		const email = verifyCustomerToken(token);

		if (!email) {
			return NextResponse.json(
				{ ok: false, error: "Token wygasł" },
				{ status: 401 },
			);
		}

		const body = await request.json();
		const parsed = CreateReturnSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ ok: false, error: "Niepoprawne dane" },
				{ status: 400 },
			);
		}

		const { orderId, itemIds, reason } = parsed.data;

		// TODO: Pobierz order z Medusa, zweryfikuj że należy do tego emaila
		// i że itemIds są poprawne
		
		// Mock dla prototypu:
		const mockItems = itemIds.map((id) => ({
			orderLineItemId: id,
			productTitle: "Produkt testowy",
			quantity: 1,
			unitPrice: 10000, // 100 zł
			thumbnail: null,
		}));

		const totalToRefund = mockItems.reduce(
			(sum, item) => sum + item.unitPrice * item.quantity,
			0,
		);

		const returnRequest = await createReturnRequest({
			orderId,
			orderDisplayId: 1234, // TODO: z Medusa
			customerEmail: email,
			items: mockItems,
			reason,
			totalToRefund,
		});

		// Wyślij email do klienta
		await sendTransactionalEmail({
			to: email,
			subject: "Złożono wniosek o odstąpienie od umowy — RetroHouse",
			text: `Otrzymaliśmy Twój wniosek o odstąpienie od umowy (zamówienie #${returnRequest.orderDisplayId}).\n\nOdpowiemy w ciągu 2 dni roboczych.\n\nRetroHouse`,
			html: `
				<div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
					<h2 style="color: #2D1810;">Wniosek o odstąpienie od umowy</h2>
					<p>Otrzymaliśmy Twój wniosek dotyczący zamówienia <strong>#${returnRequest.orderDisplayId}</strong>.</p>
					<p style="color: #666;">Odpowiemy w ciągu 2 dni roboczych na adres ${email}.</p>
					<p style="color: #666; font-size: 14px; margin-top: 32px;">RetroHouse</p>
				</div>
			`,
		});

		// Wyślij email do admina
		await sendTransactionalEmail({
			to: EMAIL_CONTACT,
			subject: `Nowy zwrot: zamówienie #${returnRequest.orderDisplayId}`,
			text: `Klient ${email} złożył wniosek o zwrot.\n\nPowód: ${reason}\n\nZobacz: ${process.env.NEXT_PUBLIC_SITE_URL}/magazyn/zwroty`,
			html: `
				<div style="font-family: system-ui, sans-serif;">
					<h3>Nowy wniosek o zwrot</h3>
					<p><strong>Zamówienie:</strong> #${returnRequest.orderDisplayId}</p>
					<p><strong>Email:</strong> ${email}</p>
					<p><strong>Powód:</strong> ${reason}</p>
					<a href="${process.env.NEXT_PUBLIC_SITE_URL}/magazyn/zwroty" style="display: inline-block; margin-top: 16px; padding: 8px 16px; background: #7D5A3C; color: white; text-decoration: none; border-radius: 4px;">Zobacz w magazynie</a>
				</div>
			`,
		});

		return NextResponse.json({ ok: true, returnId: returnRequest.id });
	} catch (error) {
		console.error("Create return error:", error);
		return NextResponse.json(
			{ ok: false, error: "Nie udało się utworzyć wniosku" },
			{ status: 500 },
		);
	}
}
