import type { CustomerOrder } from "@/lib/customer/orders";
import type { ReturnItem } from "@/lib/admin/return-types";
import {
	getLineItemsBlockedByOtherCases,
	validateReturnLineItemSelection,
} from "@/lib/customer/return-line-items";

export function buildReturnItemsFromOrder(
	order: CustomerOrder,
	itemIds: string[],
): { items: ReturnItem[]; totalToRefund: number } {
	const blocked = getLineItemsBlockedByOtherCases(order);
	const selectionError = validateReturnLineItemSelection(
		order.items,
		itemIds,
		blocked,
	);
	if (selectionError) {
		throw new Error("INVALID_SELECTION");
	}

	const items: ReturnItem[] = [];

	for (const itemId of itemIds) {
		const line = order.items.find((item) => item.id === itemId);
		if (!line) {
			throw new Error("INVALID_ITEM");
		}
		items.push({
			orderLineItemId: line.id,
			productTitle: line.title,
			quantity: line.quantity,
			unitPrice: line.unitPrice,
			thumbnail: line.thumbnail,
		});
	}

	const totalToRefund = items.reduce(
		(sum, item) => sum + item.unitPrice * item.quantity,
		0,
	);

	return { items, totalToRefund };
}
