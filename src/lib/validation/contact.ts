import { z } from "zod";

/**
 * Kontaktowy formularz — Zod schema. Topic enum matchuje
 * ContactTopic w `src/lib/analytics/events.ts`.
 */
export const CONTACT_TOPICS = ["produkt", "b2b", "wysylka", "inne"] as const;

export const ContactSchema = z.object({
	name: z.string().trim().min(2, "Podaj imię."),
	email: z.string().email("Podaj prawidłowy e-mail."),
	topic: z.enum(CONTACT_TOPICS),
	message: z.string().trim().min(20, "Wiadomość musi mieć minimum 20 znaków."),
});

export type ContactInput = z.input<typeof ContactSchema>;
export type ContactData = z.output<typeof ContactSchema>;
