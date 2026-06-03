"use server";

import { revalidatePath } from "next/cache";
import { getContactFormsConfig, saveContactFormsConfig } from "@/lib/admin/contact-forms";
import type { ContactFormsConfig } from "@/lib/contact/default-forms";
import { loadAdmin } from "@/lib/admin/load";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveContactFormsAction(
	config: ContactFormsConfig,
): Promise<ActionResult> {
	try {
		await loadAdmin(() => saveContactFormsConfig(config));
		revalidatePath("/magazyn/formularze");
		revalidatePath("/kontakt");
		revalidatePath("/polityka-prywatnosci");
		revalidatePath("/regulamin");
		revalidatePath("/konto");
		revalidatePath("/magazyn/formularze/wyslane");
		return { ok: true };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Nie udało się zapisać.";
		return { ok: false, error: message };
	}
}

export async function reloadContactFormsAction(): Promise<ContactFormsConfig> {
	return loadAdmin(getContactFormsConfig);
}
