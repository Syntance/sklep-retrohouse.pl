"use server";

import { headers } from "next/headers";
import { allocateContactCaseNumber } from "@/lib/admin/contact-case-number";
import {
	getContactFormByPreset,
	getContactFormsConfig,
	getRecipientEmailForPreset,
} from "@/lib/admin/contact-forms";
import { sendContactConfirmationEmail } from "@/lib/email/send-contact-confirmation";
import { sendContactNotification } from "@/lib/email/send-contact-notification";
import { rateLimit } from "@/lib/rate-limit";
import {
	ContactSchema,
	CONTACT_TOPIC_PRESETS,
	type ContactTopicPreset,
	type ContactTopicValue,
} from "@/lib/validation/contact";

export type ContactState =
	| { status: "idle" }
	| { status: "error"; errors: Record<string, string>; message?: string }
	| {
			status: "success";
			topic: ContactTopicValue;
			topicOther?: string;
			caseNumber: string;
	  };

function parseFormPreset(raw: FormDataEntryValue | null): ContactTopicPreset {
	const value = typeof raw === "string" ? raw : "";
	if (value in CONTACT_TOPIC_PRESETS) {
		return value as ContactTopicPreset;
	}
	return "kontakt";
}

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

	const formPreset = parseFormPreset(formData.get("formPreset"));

	const parsed = ContactSchema.safeParse({
		name: formData.get("name"),
		email: formData.get("email"),
		topic: formData.get("topic"),
		topicOther: formData.get("topicOther") || undefined,
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

	const config = await getContactFormsConfig();
	const formDef = getContactFormByPreset(config, formPreset);
	if (!formDef.enabled) {
		return {
			status: "error",
			errors: {},
			message: "Ten formularz jest chwilowo niedostępny. Napisz bezpośrednio na kontakt@sklep-retrohouse.pl.",
		};
	}

	const allowedTopics = new Set(formDef.topics.filter((t) => t.enabled).map((t) => t.value));
	if (!allowedTopics.has(parsed.data.topic)) {
		return {
			status: "error",
			errors: { topic: "Wybierz prawidłowy temat." },
		};
	}

	let caseNumber: string;
	try {
		caseNumber = await allocateContactCaseNumber();
	} catch {
		return {
			status: "error",
			errors: {},
			message: "Nie udało się nadać numeru sprawy. Spróbuj ponownie za chwilę.",
		};
	}

	const recipientEmail = getRecipientEmailForPreset(config, formPreset);

	const mail = await sendContactNotification(parsed.data, {
		recipientEmail,
		caseNumber,
		formName: formDef.name,
	});
	if (!mail.ok) {
		return { status: "error", errors: {}, message: mail.message };
	}

	const confirmation = await sendContactConfirmationEmail(parsed.data, caseNumber);
	if (!confirmation.ok) {
		return {
			status: "error",
			errors: {},
			message: confirmation.message,
		};
	}

	return {
		status: "success",
		topic: parsed.data.topic,
		topicOther: parsed.data.topicOther,
		caseNumber,
	};
}
