import type { ReturnRequest, ReturnStatus } from "@/lib/admin/return-types";
import { isActiveReturnStatus } from "@/lib/customer/return-request-active";
import {
	mapReturnItemsToCustomer,
	type CustomerReturnLineItem,
} from "@/lib/customer/return-line-items";

export type { CustomerReturnLineItem };

const STATUS_LABELS: Record<ReturnStatus, string> = {
	pending_approval: "Odstąpienie złożone",
	approved: "Odstąpienie zaakceptowane",
	shipped: "Przesyłka zwrotna w drodze",
	received: "Zwrot u nas — w realizacji",
	refunded: "Zwrot środków zakończony",
	rejected: "Odstąpienie odrzucone",
	canceled: "Odstąpienie anulowane",
};

const STATUS_HINTS: Partial<Record<ReturnStatus, string>> = {
	pending_approval:
		"Rozpatrujemy wniosek o odstąpienie od umowy. Odpowiemy w ciągu 2 dni roboczych.",
	approved:
		"Zaakceptowaliśmy odstąpienie. Wyślij towar na adres podany w e-mailu — po otrzymaniu zwrotu rozliczymy zamówienie.",
	shipped: "Otrzymaliśmy informację, że przesyłka zwrotna jest w drodze.",
	received: "Mamy towar — przygotowujemy zwrot środków.",
	refunded: "Środki zostały zwrócone — sprawa zamknięta.",
	rejected:
		"Wniosek o odstąpienie został odrzucony. Szczegóły w wiadomości e-mail.",
};

export type CustomerWithdrawalInfo = {
	id: string;
	status: ReturnStatus;
	statusLabel: string;
	statusHint: string | null;
	itemIds: string[];
	items: CustomerReturnLineItem[];
	createdAt: string;
	updatedAt: string;
	approvedAt: string | null;
	isActive: boolean;
};

export function mapReturnToCustomerWithdrawal(
	ret: ReturnRequest,
): CustomerWithdrawalInfo {
	return {
		id: ret.id,
		status: ret.status,
		statusLabel: STATUS_LABELS[ret.status],
		statusHint: STATUS_HINTS[ret.status] ?? null,
		itemIds: ret.items.map((i) => i.orderLineItemId),
		items: mapReturnItemsToCustomer(ret.items),
		createdAt: ret.createdAt,
		updatedAt: ret.updatedAt,
		approvedAt: ret.approvedAt,
		isActive: isActiveReturnStatus(ret.status),
	};
}
