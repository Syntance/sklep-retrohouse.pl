"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { recordAudit } from "@/lib/admin/audit-log";
import { createManualOrder, searchOrderFormProducts } from "@/lib/admin/manual-order";
import { AdminApiError, AdminUnauthorizedError } from "@/lib/admin/medusa-admin";
import { requireAdminSession } from "@/lib/admin/require-session";
import { sendOrderStatusEmail } from "@/lib/email/order-status-email";

export type CreateManualOrderState = {
	ok: boolean;
	error: string | null;
	orderId?: string;
};

const lineSchema = z.object({
	variantId: z.string().trim().min(1),
	productTitle: z.string().trim().min(1),
});

const createManualOrderSchema = z.object({
	email: z.string().trim().email("Podaj poprawny adres e-mail."),
	firstName: z.string().trim().min(1, "Imię jest wymagane."),
	lastName: z.string().trim().min(1, "Nazwisko jest wymagane."),
	phone: z.string().trim().optional(),
	address1: z.string().trim().min(1, "Ulica i numer są wymagane."),
	postalCode: z
		.string()
		.trim()
		.regex(/^\d{2}-\d{3}$/, "Kod pocztowy w formacie 00-000."),
	city: z.string().trim().min(1, "Miasto jest wymagane."),
	companyName: z.string().trim().optional(),
	nip: z.string().trim().optional(),
	orderNotes: z.string().trim().optional(),
	sourceChannel: z.enum(["instagram", "email", "telefon", "inne"]),
	shippingOptionId: z.string().trim().min(1, "Wybierz metodę dostawy."),
	items: z.array(lineSchema).min(1, "Dodaj co najmniej jedną pozycję."),
	sendConfirmationEmail: z.boolean(),
	invoiceRequested: z.boolean(),
	idempotencyKey: z.string().trim().min(8).max(100),
});

export type ManualOrderPayload = z.input<typeof createManualOrderSchema>;

export async function searchOrderProductsAction(query: string) {
	await requireAdminSession();
	return searchOrderFormProducts(query);
}

export async function createManualOrderAction(
	payload: unknown,
): Promise<CreateManualOrderState> {
	const parsed = createManualOrderSchema.safeParse(payload);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? "Błędne dane formularza." };
	}

	let orderId: string;
	try {
		await requireAdminSession();
		const result = await createManualOrder(parsed.data);
		orderId = result.orderId;
		await recordAudit("order.create.manual", {
			target: orderId,
			meta: { source: parsed.data.sourceChannel },
		});
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		if (error instanceof AdminApiError) return { ok: false, error: error.message };
		if (error instanceof Error) return { ok: false, error: error.message };
		return { ok: false, error: "Nie udało się utworzyć zamówienia." };
	}

	if (parsed.data.sendConfirmationEmail) {
		// Best-effort — brak maila nie unieważnia utworzonego zamówienia.
		await sendOrderStatusEmail(orderId, "placed").catch(() => undefined);
	}

	revalidatePath("/magazyn/zamowienia");
	revalidatePath("/magazyn");
	return { ok: true, error: null, orderId };
}
