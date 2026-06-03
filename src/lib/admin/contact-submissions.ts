import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type { ContactFormTopicConfig } from "@/lib/contact/default-forms";
import {
	CONTACT_TOPIC_LABELS,
	type ContactTopicPreset,
	type ContactTopicValue,
} from "@/lib/validation/contact";

const SUBMISSIONS_FILE = path.join(process.cwd(), "data", "contact-submissions.json");

export type ContactSubmission = {
	id: string;
	caseNumber: string;
	formPreset: ContactTopicPreset;
	formName: string;
	customerName: string;
	customerEmail: string;
	topic: string;
	topicLabel: string;
	topicOther?: string;
	message: string;
	createdAt: string;
};

async function ensureDataDir(): Promise<void> {
	await fs.mkdir(path.dirname(SUBMISSIONS_FILE), { recursive: true });
}

async function readSubmissions(): Promise<ContactSubmission[]> {
	try {
		const raw = await fs.readFile(SUBMISSIONS_FILE, "utf-8");
		const parsed = JSON.parse(raw) as ContactSubmission[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

async function writeSubmissions(rows: ContactSubmission[]): Promise<void> {
	await ensureDataDir();
	await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(rows, null, 2));
}

export function resolveTopicLabel(input: {
	topic: string;
	topicOther?: string;
	topics?: ContactFormTopicConfig[];
}): string {
	if (input.topic === "inne" && input.topicOther?.trim()) {
		return input.topicOther.trim();
	}
	const fromConfig = input.topics?.find((t) => t.value === input.topic)?.label;
	if (fromConfig) return fromConfig;
	if (input.topic in CONTACT_TOPIC_LABELS) {
		return CONTACT_TOPIC_LABELS[input.topic as ContactTopicValue];
	}
	return input.topic;
}

export async function createContactSubmission(data: {
	caseNumber: string;
	formPreset: ContactTopicPreset;
	formName: string;
	customerName: string;
	customerEmail: string;
	topic: string;
	topicOther?: string;
	message: string;
	topics: ContactFormTopicConfig[];
}): Promise<ContactSubmission> {
	const rows = await readSubmissions();
	const submission: ContactSubmission = {
		id: `cf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
		caseNumber: data.caseNumber,
		formPreset: data.formPreset,
		formName: data.formName,
		customerName: data.customerName,
		customerEmail: data.customerEmail.toLowerCase().trim(),
		topic: data.topic,
		topicLabel: resolveTopicLabel({
			topic: data.topic,
			topicOther: data.topicOther,
			topics: data.topics,
		}),
		topicOther: data.topicOther,
		message: data.message,
		createdAt: new Date().toISOString(),
	};
	rows.unshift(submission);
	await writeSubmissions(rows);
	return submission;
}

export async function listContactSubmissions(): Promise<ContactSubmission[]> {
	const rows = await readSubmissions();
	return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getContactSubmissionById(id: string): Promise<ContactSubmission | null> {
	const rows = await readSubmissions();
	return rows.find((r) => r.id === id) ?? null;
}

export async function listContactSubmissionsForEmail(email: string): Promise<ContactSubmission[]> {
	const normalized = email.toLowerCase().trim();
	return (await listContactSubmissions()).filter((r) => r.customerEmail === normalized);
}
