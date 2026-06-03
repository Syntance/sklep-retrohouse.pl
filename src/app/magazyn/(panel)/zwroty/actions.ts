"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminUnauthorizedError } from "@/lib/admin/medusa-admin";
import { getSessionToken } from "@/lib/admin/session";
import { getAllReturns, getReturnById, updateReturnStatus } from "@/lib/admin/returns";
import { sendReturnStatusCustomerEmail } from "@/lib/email/return-status-customer-email";
import type { ReturnStatus } from "@/lib/admin/return-types";

export async function getReturnsListAction() {
	const token = await getSessionToken();
	if (!token) throw new AdminUnauthorizedError("No session token");

	try {
		const returns = await getAllReturns();
		return { ok: true as const, returns };
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		return { ok: false as const, error: "Nie udało się pobrać zwrotów" };
	}
}

export async function getReturnDetailAction(id: string) {
	const token = await getSessionToken();
	if (!token) throw new AdminUnauthorizedError("No session token");

	try {
		const returnReq = await getReturnById(id);
		if (!returnReq) return { ok: false as const, error: "Nie znaleziono zwrotu" };
		return { ok: true as const, return: returnReq };
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		return { ok: false as const, error: "Błąd pobierania zwrotu" };
	}
}

export async function updateReturnStatusAction(
	id: string,
	status: ReturnStatus,
	extra?: { rejectionReason?: string; adminNotes?: string },
) {
	const token = await getSessionToken();
	if (!token) throw new AdminUnauthorizedError("No session token");

	try {
		await updateReturnStatus(id, status, extra);

		// Wyślij email do klienta o zmianie statusu
		const returnReq = await getReturnById(id);
		if (returnReq) {
			await sendReturnStatusCustomerEmail(returnReq, status, extra);
		}

		revalidatePath("/magazyn/zwroty");
		return { ok: true as const };
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		return { ok: false as const, error: "Nie udało się zaktualizować statusu" };
	}
}
