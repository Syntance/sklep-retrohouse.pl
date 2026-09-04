"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
	type CategoryInput,
	createCategory,
	deleteCategory,
	updateCategory,
} from "@/lib/admin/categories";
import { recordAudit } from "@/lib/admin/audit-log";
import { AdminApiError, AdminUnauthorizedError } from "@/lib/admin/medusa-admin";
import { requireAdminSession } from "@/lib/admin/require-session";
import { slugify } from "@/lib/admin/slug";

export type CategoryActionState = { error: string | null; ok: boolean };

const schema = z.object({
	id: z.string().trim().optional(),
	name: z.string().trim().min(2, "Nazwa musi mieć min. 2 znaki."),
	description: z.string(),
	isActive: z.boolean(),
});

export type CategoryPayload = z.input<typeof schema>;

export async function saveCategoryAction(payload: CategoryPayload): Promise<CategoryActionState> {
	const parsed = schema.safeParse(payload);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? "Błędne dane." };
	}

	const data = parsed.data;
	const input: CategoryInput = {
		name: data.name,
		handle: slugify(data.name),
		description: data.description,
		isActive: data.isActive,
	};

	try {
		await requireAdminSession();
		if (data.id) {
			await updateCategory(data.id, input);
		} else {
			await createCategory(input);
		}
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		if (error instanceof AdminApiError) return { ok: false, error: error.message };
		return { ok: false, error: "Nie udało się zapisać kategorii." };
	}

	await recordAudit(data.id ? "category.update" : "category.create", {
		target: data.id ?? input.handle,
	});
	revalidatePath("/magazyn/kategorie");
	return { ok: true, error: null };
}

export async function deleteCategoryAction(id: string): Promise<CategoryActionState> {
	try {
		await requireAdminSession();
		await deleteCategory(id);
	} catch (error) {
		if (error instanceof AdminUnauthorizedError) redirect("/magazyn/auth/logout");
		if (error instanceof AdminApiError) return { ok: false, error: error.message };
		return { ok: false, error: "Nie udało się usunąć kategorii." };
	}

	await recordAudit("category.delete", { target: id });
	revalidatePath("/magazyn/kategorie");
	return { ok: true, error: null };
}
