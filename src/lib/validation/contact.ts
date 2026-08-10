import { z } from "zod";

/**
 * Kontaktowy formularz — Zod schema (server actions).
 *
 * Tematy/etykiety/presety mieszkają w contact-topics.ts (moduł bez zoda) —
 * komponenty klienckie MUSZĄ importować stamtąd, żeby nie wciągać zoda
 * do initial JS. Re-eksport niżej trzyma kompatybilność importów
 * serwerowych (akcje, e-maile, admin).
 */

export {
	ALL_CONTACT_TOPICS,
	CONTACT_TOPIC_LABELS,
	CONTACT_TOPIC_PRESETS,
	CONTACT_TOPICS,
	type ContactTopicPreset,
	type ContactTopicValue,
	formatContactTopicLabel,
	getContactTopicOptions,
} from "./contact-topics";

export const ContactSchema = z
	.object({
		name: z.string().trim().min(2, "Podaj imię."),
		email: z.string().email("Podaj prawidłowy e-mail."),
		topic: z.string().trim().min(1, "Wybierz temat."),
		topicOther: z.string().trim().max(80).optional(),
		message: z.string().trim().min(20, "Wiadomość musi mieć minimum 20 znaków."),
	})
	.superRefine((data, ctx) => {
		if (data.topic !== "inne") return;
		const other = data.topicOther?.trim();
		if (!other || other.length < 2) {
			ctx.addIssue({
				code: "custom",
				message: "Podaj temat wiadomości.",
				path: ["topicOther"],
			});
		}
	});

export type ContactInput = z.input<typeof ContactSchema>;
export type ContactData = z.output<typeof ContactSchema>;
