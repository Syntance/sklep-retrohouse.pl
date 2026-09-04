import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createReturnRequest, getActiveClaimForOrder } from "@/lib/admin/returns";
import { getCustomerEmailFromRequest } from "@/lib/customer/authorize-request";
import { getCustomerOrderById } from "@/lib/customer/orders";
import { buildReturnItemsFromOrder } from "@/lib/customer/return-items";
import {
	getLineItemsBlockedByOtherCases,
	validateReturnLineItemSelection,
} from "@/lib/customer/return-line-items";
import { buildCaseRenderVarsForNewWithdrawal } from "@/lib/email/case-email-context";
import { EMAIL_CONTACT } from "@/lib/email/constants";
import { buildCustomerCaseEmailBodies } from "@/lib/email/customer-case-email";
import { sendCaseCustomerEmail } from "@/lib/email/send-case-customer-email";
import { sendTransactionalEmail } from "@/lib/email/send-transactional";
import { CreateReturnSchema } from "@/lib/validation/returns";

/**
 * POST /api/returns/create
 * Odstąpienie od umowy (14 dni). Wymaga tokenu klienta.
 */
export async function POST(request: Request) {
	try {
		const email = getCustomerEmailFromRequest(request);
		if (!email) {
			return NextResponse.json({ ok: false, error: "Brak autoryzacji" }, { status: 401 });
		}

		const body = await request.json();
		const parsed = CreateReturnSchema.safeParse(body);

		if (!parsed.success) {
			const first = parsed.error.issues[0]?.message ?? "Niepoprawne dane";
			return NextResponse.json({ ok: false, error: first }, { status: 400 });
		}

		const { orderId, itemIds, reason } = parsed.data;

		const order = await getCustomerOrderById(email, orderId);
		if (!order) {
			return NextResponse.json(
				{ ok: false, error: "Nie znaleziono zamówienia dla tego konta." },
				{ status: 404 },
			);
		}

		if (!order.canReturn) {
			return NextResponse.json(
				{ ok: false, error: "Upłynął termin 14 dni na odstąpienie od umowy." },
				{ status: 400 },
			);
		}

		const activeClaim = await getActiveClaimForOrder(email, orderId);
		if (activeClaim) {
			const ref = activeClaim.claimReferenceId;
			return NextResponse.json(
				{
					ok: false,
					error: ref
						? `Na tym zamówieniu trwa reklamacja (${ref}). Odstąpienie nie jest możliwe równolegle.`
						: "Na tym zamówieniu trwa reklamacja — odstąpienie nie jest możliwe równolegle.",
				},
				{ status: 409 },
			);
		}

		const selectionError = validateReturnLineItemSelection(
			order.items,
			itemIds,
			getLineItemsBlockedByOtherCases(order),
		);
		if (selectionError) {
			return NextResponse.json({ ok: false, error: selectionError }, { status: 400 });
		}

		let built: ReturnType<typeof buildReturnItemsFromOrder>;
		try {
			built = buildReturnItemsFromOrder(order, itemIds);
		} catch {
			return NextResponse.json(
				{ ok: false, error: "Nieprawidłowe pozycje zamówienia." },
				{ status: 400 },
			);
		}
		const { items, totalToRefund } = built;

		const returnRequest = await createReturnRequest({
			requestType: "withdrawal",
			orderId: order.id,
			orderDisplayId: order.displayId,
			customerEmail: email,
			items,
			reason,
			totalToRefund,
		});

		const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sklep-retrohouse.pl";

		const caseVars = buildCaseRenderVarsForNewWithdrawal({
			orderDisplayId: order.displayId,
			productTitles: items.map((item) => item.productTitle),
		});
		const customerBodies = buildCustomerCaseEmailBodies({
			tab: "zwroty",
			textBody:
				`Otrzymaliśmy Twój wniosek o odstąpienie od umowy (zamówienie #${order.displayId}).\n\n` +
				`Odpowiemy w ciągu 2 dni roboczych.`,
			htmlBody:
				`<h2 style="color:#2D1810;margin:0 0 12px">Wniosek o odstąpienie</h2>` +
				`<p>Zamówienie <strong>#${order.displayId}</strong></p>` +
				`<p style="color:#666">Odpowiemy w ciągu 2 dni roboczych.</p>`,
		});

		await sendCaseCustomerEmail({
			templateType: "withdrawal_received",
			to: email,
			vars: caseVars,
			fallback: {
				subject: "Złożono wniosek o odstąpienie od umowy — RetroHouse",
				text: customerBodies.text,
				html: customerBodies.html,
			},
		});

		await sendTransactionalEmail({
			to: EMAIL_CONTACT,
			subject: `Nowy zwrot: zamówienie #${order.displayId}`,
			text:
				`Klient ${email} złożył wniosek o odstąpienie.\n\n` +
				`Powód: ${reason}\n\n` +
				`Panel: ${siteUrl}/magazyn/zwroty/${returnRequest.id}`,
			html: `<div style="font-family:system-ui,sans-serif"><h3>Nowe odstąpienie</h3><p><strong>#${order.displayId}</strong> · ${email}</p><p>${reason}</p><p><a href="${siteUrl}/magazyn/zwroty/${returnRequest.id}">Magazyn</a></p></div>`,
		});

		revalidatePath("/magazyn/zwroty");

		return NextResponse.json({ ok: true, returnId: returnRequest.id });
	} catch (error) {
		console.error("Create return error:", error);
		return NextResponse.json(
			{ ok: false, error: "Nie udało się utworzyć wniosku" },
			{ status: 500 },
		);
	}
}
