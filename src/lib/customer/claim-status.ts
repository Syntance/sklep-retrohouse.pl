import type { ReturnRequest, ReturnStatus } from "@/lib/admin/return-types";
import { CLAIM_REMEDY_LABELS } from "@/lib/claims/labels";
import { isActiveReturnStatus } from "@/lib/customer/return-request-active";
import {
	mapReturnItemsToCustomer,
	type CustomerReturnLineItem,
} from "@/lib/customer/return-line-items";

export type { CustomerReturnLineItem };

export { getReturnToneClasses as getClaimToneClasses } from "@/lib/customer/return-request-visual";

export function isActiveClaimStatus(status: ReturnStatus): boolean {
	return isActiveReturnStatus(status);
}

const STATUS_LABELS: Record<ReturnStatus, string> = {
	pending_approval: "Reklamacja złożona",
	approved: "Reklamacja zaakceptowana",
	shipped: "Przesyłka w drodze",
	received: "Towar u nas — w realizacji",
	refunded: "Reklamacja zakończona",
	rejected: "Reklamacja odrzucona",
	canceled: "Reklamacja anulowana",
};

const STATUS_HINTS: Partial<Record<ReturnStatus, string>> = {
	pending_approval:
		"Rozpatrujemy zgłoszenie. Odpowiemy w terminie 14 dni — potwierdzenie masz na e-mailu.",
	approved:
		"Zaakceptowaliśmy reklamację. O kolejnych krokach (np. wysyłka towaru do naprawy) poinformujemy Cię e-mailowo.",
	shipped: "Otrzymaliśmy informację, że przesyłka jest w drodze do nas.",
	received: "Mamy towar — realizujemy ustalone żądanie.",
	refunded: "Sprawa została zamknięta.",
	rejected:
		"Reklamacja została odrzucona. Szczegóły w wiadomości e-mail. W razie pytań napisz do nas.",
};

export type CustomerClaimInfo = {
	id: string;
	referenceId: string | null;
	status: ReturnStatus;
	statusLabel: string;
	statusHint: string | null;
	remedyLabel: string | null;
	itemIds: string[];
	items: CustomerReturnLineItem[];
	createdAt: string;
	updatedAt: string;
	approvedAt: string | null;
	isActive: boolean;
};

export function mapReturnToCustomerClaim(ret: ReturnRequest): CustomerClaimInfo {
	const remedyLabel =
		ret.claimRemedy !== null ? CLAIM_REMEDY_LABELS[ret.claimRemedy] : null;

	return {
		id: ret.id,
		referenceId: ret.claimReferenceId,
		status: ret.status,
		statusLabel: STATUS_LABELS[ret.status],
		statusHint: STATUS_HINTS[ret.status] ?? null,
		remedyLabel,
		itemIds: ret.items.map((i) => i.orderLineItemId),
		items: mapReturnItemsToCustomer(ret.items),
		createdAt: ret.createdAt,
		updatedAt: ret.updatedAt,
		approvedAt: ret.approvedAt,
		isActive: isActiveReturnStatus(ret.status),
	};
}
