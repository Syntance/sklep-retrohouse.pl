"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminUnauthorizedError } from "@/lib/admin/medusa-admin";
import { getSessionToken } from "@/lib/admin/session";
import { getAllReturns, getReturnById, updateReturnStatus } from "@/lib/admin/returns";
import { sendTransactionalEmail } from "@/lib/email/send-transactional";
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
			let subject = "";
			let message = "";

			if (status === "approved") {
				subject = "Zwrot zaakceptowany — RetroHouse";
				message = `Twój wniosek o zwrot (zamówienie #${returnReq.orderDisplayId}) został zaakceptowany.\n\nWyślij przesyłkę zwrotną na adres:\nRetroHouse\nul. Ludźmierska 25A\n34-400 Nowy Targ\n\nPo otrzymaniu zwrotu prześlemyrozliczenie.`;
			} else if (status === "refunded") {
				subject = "Zwrot środków — RetroHouse";
				message = `Zwróciliśmy środki za zamówienie #${returnReq.orderDisplayId}.\n\nKwota ${(returnReq.totalToRefund / 100).toFixed(2)} zł zostanie na Twoim koncie w ciągu 3-5 dni roboczych.`;
			} else if (status === "rejected") {
				subject = "Zwrot odrzucony — RetroHouse";
				message = `Twój wniosek o zwrot (zamówienie #${returnReq.orderDisplayId}) został odrzucony.\n\nPowód: ${extra?.rejectionReason ?? "Nie podano przyczyny"}\n\nJeśli masz pytania, skontaktuj się z nami.`;
			}

			if (subject) {
				await sendTransactionalEmail({
					to: returnReq.customerEmail,
					subject,
					text: message,
					html: `<div style="font-family: system-ui, sans-serif; max-width: 500px; padding: 24px;"><p>${message.replace(/\n/g, "<br>")}</p></div>`,
				});
			}
		}

		revalidatePath("/magazyn/zwroty");
		return { ok: true as const };
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		return { ok: false as const, error: "Nie udało się zaktualizować statusu" };
	}
}
