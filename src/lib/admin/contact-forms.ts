import "server-only";

import { z } from "zod";
import {
	buildDefaultContactFormsConfig,
	buildDefaultTopicsForPreset,
	getDefaultFormByPreset,
	type ContactFormDefinition,
	type ContactFormsConfig,
	type ContactFormTopicConfig,
} from "@/lib/contact/default-forms";
import {
	CONTACT_TOPIC_LABELS,
	type ContactTopicPreset,
	type ContactTopicValue,
} from "@/lib/validation/contact";
import { adminFetch } from "./medusa-admin";

const METADATA_KEY = "contact_forms_config";

const topicSchema = z.object({
	value: z.string().min(1),
	label: z.string().min(1).max(120),
	enabled: z.boolean(),
});

const formSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1).max(120),
	pages: z.array(z.string().min(1)).min(1),
	recipientEmail: z.string().email(),
	topics: z.array(topicSchema).min(1),
	enabled: z.boolean(),
});

const configSchema = z.object({
	forms: z.array(formSchema).min(1),
});

type MedusaStore = {
	id: string;
	metadata?: Record<string, unknown> | null;
};

async function getStore(): Promise<MedusaStore> {
	const data = await adminFetch<{ stores: MedusaStore[] }>("/admin/stores?limit=1&fields=id,metadata");
	const store = data.stores[0];
	if (!store) throw new Error("Nie znaleziono sklepu w Medusa.");
	return store;
}

function parseConfig(raw: unknown): ContactFormsConfig | null {
	if (typeof raw !== "string" || !raw.trim()) return null;
	try {
		const parsed = configSchema.safeParse(JSON.parse(raw));
		return parsed.success ? (parsed.data as ContactFormsConfig) : null;
	} catch {
		return null;
	}
}

function mergeWithDefaults(saved: ContactFormsConfig | null): ContactFormsConfig {
	const defaults = buildDefaultContactFormsConfig();
	if (!saved) return defaults;

	const byId = new Map(saved.forms.map((f) => [f.id, f]));
	return {
		forms: defaults.forms.map((def) => {
			const override = byId.get(def.id);
			if (!override) return def;
			const topicMap = new Map(override.topics.map((t) => [t.value, t]));
			const topics = def.topics.map((base) => {
				const custom = topicMap.get(base.value);
				return custom ?? base;
			});
			for (const t of override.topics) {
				if (!topics.some((x) => x.value === t.value)) {
					topics.push(t);
				}
			}
			return {
				...def,
				name: override.name || def.name,
				pages: override.pages.length > 0 ? override.pages : def.pages,
				recipientEmail: override.recipientEmail || def.recipientEmail,
				enabled: override.enabled,
				topics,
			};
		}),
	};
}

export async function getContactFormsConfig(): Promise<ContactFormsConfig> {
	const store = await getStore();
	const saved = parseConfig(store.metadata?.[METADATA_KEY]);
	return mergeWithDefaults(saved);
}

export async function saveContactFormsConfig(config: ContactFormsConfig): Promise<void> {
	const parsed = configSchema.safeParse(config);
	if (!parsed.success) throw new Error("Nieprawidłowa konfiguracja formularzy.");

	const store = await getStore();
	await adminFetch(`/admin/stores/${store.id}`, {
		method: "POST",
		body: JSON.stringify({
			metadata: {
				...(store.metadata ?? {}),
				[METADATA_KEY]: JSON.stringify(parsed.data),
			},
		}),
	});
}

export function getContactFormByPreset(
	config: ContactFormsConfig,
	preset: ContactTopicPreset,
): ContactFormDefinition {
	const found = config.forms.find((f) => f.id === preset);
	if (found) return found;
	return getDefaultFormByPreset(preset);
}

export function getContactTopicOptionsFromConfig(
	config: ContactFormsConfig,
	preset: ContactTopicPreset,
): Array<{ value: string; label: string }> {
	const form = getContactFormByPreset(config, preset);
	if (!form.enabled) return [];
	return form.topics
		.filter((t) => t.enabled)
		.map((t) => ({ value: t.value, label: t.label }));
}

export function getRecipientEmailForPreset(
	config: ContactFormsConfig,
	preset: ContactTopicPreset,
): string {
	return getContactFormByPreset(config, preset).recipientEmail;
}

/** Przywraca domyślne tematy etykiet dla jednego formularza. */
export function resetTopicsToCodeDefaults(preset: ContactTopicPreset): ContactFormTopicConfig[] {
	return buildDefaultTopicsForPreset(preset).map((t) => ({
		...t,
		label:
			t.value in CONTACT_TOPIC_LABELS
				? CONTACT_TOPIC_LABELS[t.value as ContactTopicValue]
				: t.label,
	}));
}
