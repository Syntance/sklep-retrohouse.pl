export type CustomerReturnLineItem = {
	orderLineItemId: string;
	productTitle: string;
	quantity: number;
};

/**
 * Minimalne kształty strukturalne (zamiast pełnego `CustomerOrder`) —
 * pełny typ importowałby `orders.ts` i domykał cykl orders → *-status → return-line-items → orders.
 */
type OrderWithCases = {
	claims: Array<{ itemIds: string[] }>;
	withdrawals: Array<{ itemIds: string[] }>;
};

type SelectableLineItem = { id: string };

/** Pozycje już objęte inną reklamacją lub odstąpieniem na tym zamówieniu. */
export function getLineItemsBlockedByOtherCases(order: OrderWithCases): Set<string> {
	return new Set([
		...order.claims.flatMap((c) => c.itemIds),
		...order.withdrawals.flatMap((w) => w.itemIds),
	]);
}

/** Walidacja wyboru pozycji przed wysłaniem wniosku (UI + API). */
export function validateReturnLineItemSelection(
	orderItems: SelectableLineItem[],
	selectedIds: string[],
	excludedIds: Set<string>,
): string | null {
	const eligible = orderItems.filter((item) => !excludedIds.has(item.id));
	if (eligible.length === 0) {
		return "Wszystkie produkty z tego zamówienia są już objęte inną sprawą.";
	}
	if (selectedIds.length === 0) {
		return "Wybierz produkt, którego dotyczy zgłoszenie.";
	}
	if (eligible.length > 1 && selectedIds.length !== 1) {
		return "Wybierz dokładnie jeden produkt z zamówienia.";
	}
	const picked = selectedIds[0];
	if (!eligible.some((item) => item.id === picked)) {
		return "Wybrany produkt nie jest dostępny do zgłoszenia.";
	}
	return null;
}

export function mapReturnItemsToCustomer(
	items: Array<{
		orderLineItemId: string;
		productTitle: string;
		quantity: number;
	}>,
): CustomerReturnLineItem[] {
	return items.map((item) => ({
		orderLineItemId: item.orderLineItemId,
		productTitle: item.productTitle,
		quantity: item.quantity,
	}));
}
