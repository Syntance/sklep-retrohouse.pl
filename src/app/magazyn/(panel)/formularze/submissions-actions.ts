"use server";

import { loadAdmin } from "@/lib/admin/load";
import {
	getContactSubmissionById,
	listContactSubmissions,
} from "@/lib/admin/contact-submissions";

export async function getSubmissionsListAction() {
	try {
		const submissions = await loadAdmin(listContactSubmissions);
		return { ok: true as const, submissions };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Nie udało się wczytać listy.";
		return { ok: false as const, error: message };
	}
}

export async function getSubmissionDetailAction(id: string) {
	try {
		const submission = await loadAdmin(() => getContactSubmissionById(id));
		if (!submission) {
			return { ok: false as const, error: "Nie znaleziono zgłoszenia." };
		}
		return { ok: true as const, submission };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Nie udało się wczytać szczegółów.";
		return { ok: false as const, error: message };
	}
}
