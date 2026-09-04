"use server";

import { revalidatePath } from "next/cache";
import { recordAudit } from "@/lib/admin/audit-log";
import { getContactFormsConfig, saveContactFormsConfig } from "@/lib/admin/contact-forms";
import { loadAdmin } from "@/lib/admin/load";
import type { ContactFormsConfig } from "@/lib/contact/default-forms";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveContactFormsAction(config: ContactFormsConfig): Promise<ActionResult> {
	try {
		await loadAdmin(() => saveContactFormsConfig(config));
		await recordAudit("contact-forms.config.save");
		revalidatePath("/magazyn/formularze");
		revalidatePath("/kontakt");
		revalidatePath("/polityka-prywatnosci");
		revalidatePath("/regulamin");
		revalidatePath("/konto");
		revalidatePath("/magazyn/formularze/otrzymane");
		return { ok: true };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Nie udało się zapisać.";
		return { ok: false, error: message };
	}
}

export async function reloadContactFormsAction(): Promise<ContactFormsConfig> {
	return loadAdmin(getContactFormsConfig);
}
