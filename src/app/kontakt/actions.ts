"use server";

import { headers } from "next/headers";
import { sendContactNotification } from "@/lib/email/send-contact-notification";
import { rateLimit } from "@/lib/rate-limit";
import { type CONTACT_TOPICS, ContactSchema } from "@/lib/validation/contact";

export type ContactState =
	| { status: "idle" }
	| { status: "error"; errors: Record<string, string>; message?: string }
	| { status: "success"; topic: (typeof CONTACT_TOPICS)[number] };

export async function submitContact(
	_prev: ContactState,
	formData: FormData,
): Promise<ContactState> {
	const headerList = await headers();
	const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
	const limit = rateLimit(`contact:${ip}`, 5, 60_000);
	if (!limit.ok) {
		return {
			status: "error",
			errors: {},
			message: "Za dużo prób z tego adresu. Spróbuj ponownie za chwilę.",
		};
	}

	const parsed = ContactSchema.safeParse({
		name: formData.get("name"),
		email: formData.get("email"),
		topic: formData.get("topic"),
		message: formData.get("message"),
	});

	if (!parsed.success) {
		const errors: Record<string, string> = {};
		for (const issue of parsed.error.issues) {
			const key = issue.path[0];
			if (typeof key === "string" && !errors[key]) {
				errors[key] = issue.message;
			}
		}
		return { status: "error", errors };
	}

	const mail = await sendContactNotification(parsed.data);
	if (!mail.ok) {
		return { status: "error", errors: {}, message: mail.message };
	}

	return { status: "success", topic: parsed.data.topic };
}
