import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
	createReturnRequest,
	getActiveClaimForOrder,
	getActiveWithdrawalForOrder,
} from "@/lib/admin/returns";
import { createClaimReference } from "@/lib/claims/reference";
import { CLAIM_REMEDY_LABELS } from "@/lib/claims/labels";
import { getCustomerEmailFromRequest } from "@/lib/customer/authorize-request";
import { buildReturnItemsFromOrder } from "@/lib/customer/return-items";
import {
	getLineItemsBlockedByOtherCases,
	validateReturnLineItemSelection,
} from "@/lib/customer/return-line-items";
import { getCustomerOrderById } from "@/lib/customer/orders";
import { EMAIL_CONTACT } from "@/lib/email/constants";
import { buildCaseRenderVarsForNewClaim } from "@/lib/email/case-email-context";
import { buildCustomerCaseEmailBodies } from "@/lib/email/customer-case-email";
import { sendCaseCustomerEmail } from "@/lib/email/send-case-customer-email";
import { sendTransactionalEmail } from "@/lib/email/send-transactional";
import { CreateClaimSchema } from "@/lib/validation/returns";

/**
 * POST /api/claims/create
 * Reklamacja — wymaga tokenu klienta (jak odstąpienie). Trafia do /magazyn/zwroty.
 */
export async function POST(request: Request) {
	try {
		const email = getCustomerEmailFromRequest(request);
		if (!email) {
			return NextResponse.json(
				{ ok: false, error: "Brak autoryzacji" },
				{ status: 401 },
			);
		}

		const body = await request.json();
		const parsed = CreateClaimSchema.safeParse(body);

		if (!parsed.success) {
			const first = parsed.error.issues[0]?.message ?? "Niepoprawne dane";
			return NextResponse.json({ ok: false, error: first }, { status: 400 });
		}

		const { orderId, itemIds, description, remedy, bankAccount } = parsed.data;

		const order = await getCustomerOrderById(email, orderId);
		if (!order) {
			return NextResponse.json(
				{ ok: false, error: "Nie znaleziono zamówienia dla tego konta." },
				{ status: 404 },
			);
		}

		if (!order.canClaim) {
			return NextResponse.json(
				{
					ok: false,
					error: "Upłynęły 2 lata od wydania towaru — reklamacji nie można już złożyć.",
				},
				{ status: 400 },
			);
		}

		const activeWithdrawal = await getActiveWithdrawalForOrder(email, orderId);
		if (activeWithdrawal) {
			return NextResponse.json(
				{
					ok: false,
					error:
						"Na tym zamówieniu trwa odstąpienie od umowy — reklamacji nie można złożyć równolegle.",
				},
				{ status: 409 },
			);
		}

		const activeClaim = await getActiveClaimForOrder(email, orderId);
		if (activeClaim) {
			const ref = activeClaim.claimReferenceId;
			return NextResponse.json(
				{
					ok: false,
					error: ref
						? `Masz już aktywną reklamację (${ref}). Status zobaczysz po zalogowaniu na tej stronie.`
						: "Masz już aktywną reklamację na to zamówienie.",
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

		let items;
		let totalToRefund;
		try {
			const built = buildReturnItemsFromOrder(order, itemIds);
			items = built.items;
			totalToRefund = built.totalToRefund;
		} catch {
			return NextResponse.json(
				{ ok: false, error: "Nieprawidłowe pozycje zamówienia." },
				{ status: 400 },
			);
		}

		const referenceId = createClaimReference();
		const remedyLabel = CLAIM_REMEDY_LABELS[remedy];
		const bankLine =
			bankAccount.trim().length > 0
				? `\nIBAN: ${bankAccount.replace(/\s+/g, "").toUpperCase()}`
				: "";

		const returnRequest = await createReturnRequest({
			requestType: "claim",
			orderId: order.id,
			orderDisplayId: order.displayId,
			customerEmail: email,
			items,
			reason: description,
			totalToRefund,
			claimRemedy: remedy,
			claimReferenceId: referenceId,
			// adminNotes ustawiane przez magazyn; remedy w polu claimRemedy
		});

		const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sklep-retrohouse.pl";

		const caseVars = buildCaseRenderVarsForNewClaim({
			orderDisplayId: order.displayId,
			referenceId,
			remedyLabel,
			productTitles: items.map((item) => item.productTitle),
		});
		const customerBodies = buildCustomerCaseEmailBodies({
			tab: "reklamacje",
			textBody:
				`Przyjęliśmy reklamację (zamówienie #${order.displayId}).\n` +
				`Numer zgłoszenia: ${referenceId}\n` +
				`Żądanie: ${remedyLabel}\n\n` +
				`Ustosunkujemy się w terminie 14 dni.\n` +
				`Zdjęcia możesz dosłać odpowiadając na ten e-mail.`,
			htmlBody:
				`<h2 style="color:#2D1810;margin:0 0 12px">Reklamacja przyjęta</h2>` +
				`<p>Zamówienie <strong>#${order.displayId}</strong><br>` +
				`Numer: <strong>${referenceId}</strong><br>Żądanie: ${remedyLabel}</p>` +
				`<p style="color:#666">Odpowiemy w ciągu 14 dni. Zdjęcia możesz dosłać odpowiadając na ten e-mail.</p>`,
		});

		await sendCaseCustomerEmail({
			templateType: "claim_received",
			to: email,
			vars: caseVars,
			fallback: {
				subject: `[RetroHouse] Reklamacja przyjęta — ${referenceId}`,
				text: customerBodies.text,
				html: customerBodies.html,
			},
		});

		const adminText =
			`Nowa reklamacja od ${email}.\n` +
			`Zamówienie: #${order.displayId}\n` +
			`Żądanie: ${remedyLabel}${bankLine}\n\n` +
			`Opis:\n${description}\n\n` +
			`Panel: ${siteUrl}/magazyn/zwroty/${returnRequest.id}`;

		await sendTransactionalEmail({
			to: EMAIL_CONTACT,
			subject: `Reklamacja ${referenceId} — zamówienie #${order.displayId}`,
			text: adminText,
			html: `<div style="font-family:system-ui,sans-serif"><h3>Nowa reklamacja</h3><p><strong>#${order.displayId}</strong> · ${email}<br>Żądanie: ${remedyLabel}</p><p>${description}</p><p><a href="${siteUrl}/magazyn/zwroty/${returnRequest.id}">Otwórz w magazynie</a></p></div>`,
		});

		revalidatePath("/magazyn/zwroty");

		return NextResponse.json({
			ok: true,
			returnId: returnRequest.id,
			referenceId,
		});
	} catch (error) {
		console.error("Create claim error:", error);
		return NextResponse.json(
			{ ok: false, error: "Nie udało się złożyć reklamacji. Spróbuj ponownie." },
			{ status: 500 },
		);
	}
}
