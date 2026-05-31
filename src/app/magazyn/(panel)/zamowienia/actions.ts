"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	archiveOrder,
	cancelOrder,
	captureOrderPayment,
	completeOrder,
	fulfillOrder,
	markOrderDelivered,
	markOrderShipped,
} from "@/lib/admin/orders";
import { AdminApiError, AdminUnauthorizedError } from "@/lib/admin/medusa-admin";

export type OrderActionState = { error: string | null; ok: boolean };

export type OrderActionType =
	| "capture"
	| "fulfill"
	| "ship"
	| "deliver"
	| "cancel"
	| "complete"
	| "archive";

const HANDLERS: Record<OrderActionType, (orderId: string) => Promise<void>> = {
	capture: captureOrderPayment,
	fulfill: fulfillOrder,
	ship: markOrderShipped,
	deliver: markOrderDelivered,
	cancel: cancelOrder,
	complete: completeOrder,
	archive: archiveOrder,
};

export async function runOrderAction(
	orderId: string,
	action: OrderActionType,
): Promise<OrderActionState> {
	const handler = HANDLERS[action];
	if (!handler) return { ok: false, error: "Nieznana akcja." };

	try {
		await handler(orderId);
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		if (error instanceof AdminApiError) return { ok: false, error: error.message };
		if (error instanceof Error) return { ok: false, error: error.message };
		return { ok: false, error: "Operacja nie powiodła się." };
	}

	revalidatePath("/magazyn/zamowienia");
	revalidatePath(`/magazyn/zamowienia/${orderId}`);
	revalidatePath("/magazyn");
	return { ok: true, error: null };
}
