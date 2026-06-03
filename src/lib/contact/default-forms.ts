import { EMAIL_ACCESS, EMAIL_CONTACT } from "@/lib/email/constants";
import {
	CONTACT_TOPIC_LABELS,
	CONTACT_TOPIC_PRESETS,
	type ContactTopicPreset,
	type ContactTopicValue,
} from "@/lib/validation/contact";

export type ContactFormTopicConfig = {
	value: ContactTopicValue;
	label: string;
	enabled: boolean;
};

export type ContactFormDefinition = {
	/** Id = preset (kontakt, regulamin, …). */
	id: ContactTopicPreset;
	name: string;
	pages: string[];
	recipientEmail: string;
	topics: ContactFormTopicConfig[];
	enabled: boolean;
};

export type ContactFormsConfig = {
	forms: ContactFormDefinition[];
};

const DEFAULT_FORM_META: Record<
	ContactTopicPreset,
	{ name: string; pages: string[]; recipientEmail: string }
> = {
	kontakt: {
		name: "Kontakt (strona główna /kontakt)",
		pages: ["/kontakt", "/"],
		recipientEmail: EMAIL_CONTACT,
	},
	regulamin: {
		name: "Regulamin sklepu",
		pages: ["/regulamin"],
		recipientEmail: EMAIL_CONTACT,
	},
	privacy: {
		name: "Polityka prywatności",
		pages: ["/polityka-prywatnosci"],
		recipientEmail: EMAIL_CONTACT,
	},
	cookies: {
		name: "Polityka cookies",
		pages: ["/polityka-cookies"],
		recipientEmail: EMAIL_CONTACT,
	},
	withdrawal: {
		name: "Odstąpienie od umowy",
		pages: ["/odstapienie"],
		recipientEmail: EMAIL_CONTACT,
	},
	claims: {
		name: "Reklamacje",
		pages: ["/reklamacje"],
		recipientEmail: EMAIL_CONTACT,
	},
	accessibility: {
		name: "Deklaracja dostępności",
		pages: ["/deklaracja-dostepnosci"],
		recipientEmail: EMAIL_ACCESS,
	},
	konto: {
		name: "Moje konto",
		pages: ["/konto"],
		recipientEmail: EMAIL_CONTACT,
	},
};

export function buildDefaultTopicsForPreset(preset: ContactTopicPreset): ContactFormTopicConfig[] {
	return CONTACT_TOPIC_PRESETS[preset].map((value) => ({
		value,
		label: CONTACT_TOPIC_LABELS[value],
		enabled: true,
	}));
}

export function buildDefaultContactFormsConfig(): ContactFormsConfig {
	const presets = Object.keys(CONTACT_TOPIC_PRESETS) as ContactTopicPreset[];
	return {
		forms: presets.map((id) => {
			const meta = DEFAULT_FORM_META[id];
			return {
				id,
				name: meta.name,
				pages: [...meta.pages],
				recipientEmail: meta.recipientEmail,
				topics: buildDefaultTopicsForPreset(id),
				enabled: true,
			};
		}),
	};
}

export function getDefaultFormByPreset(preset: ContactTopicPreset): ContactFormDefinition {
	const defaults = buildDefaultContactFormsConfig();
	const found = defaults.forms.find((f) => f.id === preset);
	if (!found) throw new Error(`Unknown contact form preset: ${preset}`);
	return found;
}
