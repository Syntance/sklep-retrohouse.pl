"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { recordAudit } from "@/lib/admin/audit-log";
import { deleteEpoch, upsertEpoch } from "@/lib/admin/epochs";
import { AdminApiError, AdminUnauthorizedError } from "@/lib/admin/medusa-admin";
import { slugify } from "@/lib/admin/slug";

export type EpochActionState = { error: string | null; ok: boolean };

const schema = z.object({
	previousValue: z.string().trim().optional(),
	label: z.string().trim().min(2, "Nazwa musi mieć min. 2 znaki."),
});

export type EpochPayload = z.input<typeof schema>;

function revalidateEpochPaths(): void {
	revalidatePath("/magazyn/epoki");
	revalidatePath("/magazyn/produkty");
	revalidatePath("/sklep");
}

export async function saveEpochAction(payload: EpochPayload): Promise<EpochActionState> {
	const parsed = schema.safeParse(payload);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? "Błędne dane." };
	}

	const data = parsed.data;
	const value = slugify(data.label);

	try {
		await upsertEpoch({ value, label: data.label.trim() }, data.previousValue);
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		if (error instanceof AdminApiError) return { ok: false, error: error.message };
		if (error instanceof Error) return { ok: false, error: error.message };
		return { ok: false, error: "Nie udało się zapisać epoki." };
	}

	await recordAudit(data.previousValue ? "epoch.update" : "epoch.create", { target: value });
	revalidateEpochPaths();
	return { ok: true, error: null };
}

export async function deleteEpochAction(value: string): Promise<EpochActionState> {
	try {
		await deleteEpoch(value);
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		if (error instanceof AdminApiError) return { ok: false, error: error.message };
		if (error instanceof Error) return { ok: false, error: error.message };
		return { ok: false, error: "Nie udało się usunąć epoki." };
	}

	await recordAudit("epoch.delete", { target: value });
	revalidateEpochPaths();
	return { ok: true, error: null };
}
