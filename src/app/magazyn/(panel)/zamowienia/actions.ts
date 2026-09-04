"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/admin/audit-log";
import { AdminApiError, AdminUnauthorizedError } from "@/lib/admin/medusa-admin";
import {
	cancelOrder,
	completeOrder,
	markOrderShipped,
	startOrderRealization,
} from "@/lib/admin/orders";
import { requireAdminSession } from "@/lib/admin/require-session";
import { type OrderEmailStage, sendOrderStatusEmail } from "@/lib/email/order-status-email";

export type OrderActionState = { error: string | null; ok: boolean };

export type OrderActionType = "capture" | "ship" | "complete" | "cancel";

const HANDLERS: Record<OrderActionType, (orderId: string) => Promise<void>> = {
	capture: startOrderRealization,
	ship: markOrderShipped,
	complete: completeOrder,
	cancel: cancelOrder,
};

const ACTION_EMAIL: Record<OrderActionType, OrderEmailStage> = {
	capture: "realization_started",
	ship: "shipped",
	complete: "completed",
	cancel: "cancelled",
};

export async function runOrderAction(
	orderId: string,
	action: OrderActionType,
): Promise<OrderActionState> {
	const handler = HANDLERS[action];
	if (!handler) return { ok: false, error: "Nieznana akcja." };

	try {
		await requireAdminSession();
		await handler(orderId);
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		if (error instanceof AdminApiError) return { ok: false, error: error.message };
		if (error instanceof Error) return { ok: false, error: error.message };
		return { ok: false, error: "Operacja nie powiodła się." };
	}

	await recordAudit(`order.${action}`, { target: orderId });
	revalidatePath("/magazyn/zamowienia");
	revalidatePath(`/magazyn/zamowienia/${orderId}`);
	revalidatePath("/magazyn");

	await sendOrderStatusEmail(orderId, ACTION_EMAIL[action]);

	return { ok: true, error: null };
}
