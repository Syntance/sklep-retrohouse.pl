"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { recordAudit } from "@/lib/admin/audit-log";
import { AdminApiError, AdminUnauthorizedError } from "@/lib/admin/medusa-admin";
import { requireAdminSession } from "@/lib/admin/require-session";
import { setShippingOptionCheckoutEnabled, updateShippingOption } from "@/lib/admin/shipping-options";

export type ShippingActionState = { error: string | null; ok: boolean };

const PATH = "/magazyn/ustawienia/dostawa";
/** Checkout pokazuje te same metody — po edycji musi zobaczyć nowe dane. */
const CHECKOUT_PATH = "/koszyk/checkout";

const toggleSchema = z.object({
	optionId: z.string().trim().min(1),
	enabled: z.boolean(),
});

const saveSchema = z.object({
	optionId: z.string().trim().min(1),
	name: z.string().trim().min(1, "Nazwa jest wymagana."),
	priceMajor: z.number().min(0, "Cena nie może być ujemna."),
	typeLabel: z.string(),
	typeDescription: z.string(),
	checkoutEnabled: z.boolean(),
});

export async function toggleShippingOptionAction(payload: {
	optionId: string;
	enabled: boolean;
}): Promise<ShippingActionState> {
	const parsed = toggleSchema.safeParse(payload);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? "Błędne dane." };
	}

	try {
		await requireAdminSession();
		await setShippingOptionCheckoutEnabled(parsed.data.optionId, parsed.data.enabled);
		await recordAudit("shipping.toggle", {
			target: parsed.data.optionId,
			meta: { enabled: parsed.data.enabled },
		});
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		if (error instanceof AdminApiError) return { ok: false, error: error.message };
		if (error instanceof Error) return { ok: false, error: error.message };
		return { ok: false, error: "Nie udało się zapisać ustawienia dostawy." };
	}

	revalidatePath(PATH);
	revalidatePath(CHECKOUT_PATH);
	return { ok: true, error: null };
}

export async function saveShippingOptionAction(
	payload: z.input<typeof saveSchema>,
): Promise<ShippingActionState> {
	const parsed = saveSchema.safeParse(payload);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? "Błędne dane." };
	}

	try {
		await requireAdminSession();
		await updateShippingOption(parsed.data.optionId, {
			name: parsed.data.name,
			priceMajor: parsed.data.priceMajor,
			typeLabel: parsed.data.typeLabel,
			typeDescription: parsed.data.typeDescription,
			checkoutEnabled: parsed.data.checkoutEnabled,
		});
		await recordAudit("shipping.update", {
			target: parsed.data.optionId,
			meta: {
				name: parsed.data.name,
				priceMajor: parsed.data.priceMajor,
				checkoutEnabled: parsed.data.checkoutEnabled,
			},
		});
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		if (error instanceof AdminApiError) return { ok: false, error: error.message };
		if (error instanceof Error) return { ok: false, error: error.message };
		return { ok: false, error: "Nie udało się zapisać metody dostawy." };
	}

	revalidatePath(PATH);
	revalidatePath(CHECKOUT_PATH);
	return { ok: true, error: null };
}
