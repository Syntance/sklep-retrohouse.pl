import type { ReturnItem, ReturnRequest } from "@/lib/admin/return-types";
import { CLAIM_REMEDY_LABELS } from "@/lib/claims/labels";
import { customerCaseEmailTab, getCustomerKontoUrl } from "@/lib/email/customer-case-email";
import { formatPrice } from "@/lib/format";

export type CaseEmailRenderVars = {
	nrZamowienia: string;
	numerZgloszenia: string;
	zadanieReklamacji: string;
	kwotaZwrotu: string;
	powodOdrzucenia: string;
	produkty: string;
	linkKonto: string;
};

function formatCaseProducts(items: ReturnItem[]): string {
	if (items.length === 0) return "—";
	return items
		.map((item) =>
			item.quantity > 1 ? `${item.productTitle} × ${item.quantity}` : item.productTitle,
		)
		.join(", ");
}

export function buildCaseRenderVarsFromReturn(
	returnReq: ReturnRequest,
	extra?: { rejectionReason?: string },
): CaseEmailRenderVars {
	const tab = customerCaseEmailTab(returnReq.requestType);
	const remedy =
		returnReq.claimRemedy && returnReq.requestType === "claim"
			? (CLAIM_REMEDY_LABELS[returnReq.claimRemedy] ?? "—")
			: "—";

	return {
		nrZamowienia: String(returnReq.orderDisplayId),
		numerZgloszenia: returnReq.claimReferenceId ?? "—",
		zadanieReklamacji: remedy,
		kwotaZwrotu: formatPrice(returnReq.totalToRefund),
		powodOdrzucenia: extra?.rejectionReason?.trim() || "Nie podano przyczyny",
		produkty: formatCaseProducts(returnReq.items),
		linkKonto: getCustomerKontoUrl(tab),
	};
}

export function buildCaseRenderVarsForNewClaim(input: {
	orderDisplayId: number;
	referenceId: string;
	remedyLabel: string;
	productTitles: string[];
}): CaseEmailRenderVars {
	return {
		nrZamowienia: String(input.orderDisplayId),
		numerZgloszenia: input.referenceId,
		zadanieReklamacji: input.remedyLabel,
		kwotaZwrotu: "—",
		powodOdrzucenia: "",
		produkty: input.productTitles.join(", ") || "—",
		linkKonto: getCustomerKontoUrl("reklamacje"),
	};
}

export function buildCaseRenderVarsForNewWithdrawal(input: {
	orderDisplayId: number;
	productTitles: string[];
}): CaseEmailRenderVars {
	return {
		nrZamowienia: String(input.orderDisplayId),
		numerZgloszenia: "—",
		zadanieReklamacji: "—",
		kwotaZwrotu: "—",
		powodOdrzucenia: "",
		produkty: input.productTitles.join(", ") || "—",
		linkKonto: getCustomerKontoUrl("zwroty"),
	};
}
