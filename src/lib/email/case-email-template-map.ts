import type { ReturnRequest, ReturnStatus } from "@/lib/admin/return-types";
import type { CaseEmailTemplateType } from "@/lib/email/template-types";

export function templateTypeForReturnStatus(
	requestType: ReturnRequest["requestType"],
	status: ReturnStatus,
): CaseEmailTemplateType | null {
	if (status === "approved") {
		return requestType === "claim" ? "claim_approved" : "withdrawal_approved";
	}
	if (status === "refunded") {
		return "case_refunded";
	}
	if (status === "rejected") {
		return requestType === "claim" ? "claim_rejected" : "withdrawal_rejected";
	}
	return null;
}
