import type { ReactNode } from "react";
import { EMAIL_ACCESS, EMAIL_CONTACT } from "@/lib/email/constants";
import type { ContactTopicPreset } from "@/lib/validation/contact-topics";

export type LegalDocumentContactSectionProps = {
	heading: string;
	topicPreset: ContactTopicPreset;
	email?: string;
	/** Tekst nad linią z e-mailem (np. termin odpowiedzi RODO). */
	noteBeforeEmail?: ReactNode;
};

/** Nagłówki sekcji kontaktowej na stronach z grupy Formalności (stopka). */
export const LEGAL_DOCUMENT_CONTACT = {
	regulamin: { heading: "Pytania o regulamin?", topicPreset: "regulamin" as const },
	privacy: {
		heading: "Kontakt w sprawie danych",
		topicPreset: "privacy" as const,
		noteBeforeEmail: (
			<p className="text-foreground/70">Odpowiadamy w 14 dni roboczych.</p>
		),
	},
	cookies: { heading: "Pytania o cookies?", topicPreset: "cookies" as const },
	withdrawal: { heading: "Pytania o odstąpienie od umowy?", topicPreset: "withdrawal" as const },
	claims: { heading: "Pytania o reklamację?", topicPreset: "claims" as const },
	konto: { heading: "Pytania o konto?", topicPreset: "konto" as const },
	accessibility: {
		heading: "Zgłoś problem z dostępnością",
		topicPreset: "accessibility" as const,
		email: EMAIL_ACCESS,
		noteBeforeEmail: (
			<p className="text-foreground/70 leading-relaxed">Odpowiadamy w ciągu 14 dni roboczych.</p>
		),
	},
} as const satisfies Record<string, LegalDocumentContactSectionProps>;
