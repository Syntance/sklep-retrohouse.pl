#!/usr/bin/env tsx
/**
 * Sync hero CMS → static (prebuild).
 * Ściąga zdjęcia hero home + prezent z Medusa metadata do `/public/images/cms/`
 * i generuje `src/lib/content/static-cms-hero.ts`.
 */

import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { CMS_HERO_STATIC_FILES } from "../src/lib/content/cms-hero-image";
import { normalizeCmsImageToWebp } from "../src/lib/content/normalize-cms-image";
import { PAGE_HERO_IMAGES } from "../src/lib/content/hero-images";

const MEDUSA_URL = (
	process.env.MEDUSA_BACKEND_URL ||
	process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
	"http://localhost:9000"
).replace(/\/$/, "");
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;

const RETROHOUSE_PAGE_CONTENT_KEY = "retrohouse_page_content";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const CMS_IMAGES_DIR = path.join(PUBLIC_DIR, "images", "cms");
const STATIC_HERO_FILE = path.join(process.cwd(), "src", "lib", "content", "static-cms-hero.ts");

const HERO_PAGES = ["home", "prezent"] as const;

type HeroPageKey = (typeof HERO_PAGES)[number];

type HeroFields = {
	productImageUrl?: string;
	productImageAlt?: string;
	productImageWidth?: number;
	productImageHeight?: number;
};

type StaticHeroEntry = {
	productImageUrl: string;
	productImageAlt: string;
	productImageWidth: number;
	productImageHeight: number;
};

function isRemoteImageUrl(url: string): boolean {
	const trimmed = url.trim();
	if (!trimmed) return false;
	if (trimmed.startsWith("/")) return false;
	try {
		const parsed = new URL(trimmed);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}

async function getAdminToken(): Promise<string | null> {
	const email = ADMIN_EMAIL?.trim();
	const password = ADMIN_PASSWORD?.trim();
	if (!email || !password) {
		console.warn("⚠ MEDUSA_ADMIN_EMAIL / MEDUSA_ADMIN_PASSWORD nie ustawione — pomijam sync hero.");
		return null;
	}

	const res = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
		signal: AbortSignal.timeout(15_000),
	});

	if (!res.ok) {
		throw new Error(`Auth failed: ${res.status} ${res.statusText}`);
	}

	const data = (await res.json()) as { token?: string };
	if (!data.token) throw new Error("Brak tokenu w odpowiedzi /auth/user/emailpass");
	return data.token;
}

async function fetchPageContentMap(token: string): Promise<Record<string, unknown>> {
	const res = await fetch(`${MEDUSA_URL}/admin/stores?limit=1&fields=id,metadata`, {
		headers: { Authorization: `Bearer ${token}` },
		signal: AbortSignal.timeout(30_000),
	});

	if (!res.ok) {
		throw new Error(`Store fetch failed: ${res.status} ${res.statusText}`);
	}

	const data = (await res.json()) as { stores: Array<{ metadata?: Record<string, unknown> }> };
	const raw = data.stores[0]?.metadata?.[RETROHOUSE_PAGE_CONTENT_KEY];
	if (typeof raw !== "string") return {};

	try {
		return JSON.parse(raw) as Record<string, unknown>;
	} catch {
		return {};
	}
}

function readHeroFields(pageContentMap: Record<string, unknown>, pageKey: HeroPageKey): HeroFields {
	const page = pageContentMap[pageKey];
	if (!page || typeof page !== "object") return {};
	const hero = (page as Record<string, unknown>).hero;
	if (!hero || typeof hero !== "object") return {};
	return hero as HeroFields;
}

async function writeNormalizedHeroImage(buffer: Buffer, filepath: string): Promise<void> {
	const webp = await normalizeCmsImageToWebp(buffer);
	fs.writeFileSync(filepath, webp);
}

async function downloadHeroImage(url: string, filename: string): Promise<boolean> {
	const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
	if (!res.ok || !res.body) {
		console.warn(`    ⚠ pominięto (HTTP ${res.status}): ${url}`);
		return false;
	}

	const chunks: Buffer[] = [];
	for await (const chunk of Readable.fromWeb(res.body as never)) {
		chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	}

	const filepath = path.join(CMS_IMAGES_DIR, filename);
	await writeNormalizedHeroImage(Buffer.concat(chunks), filepath);
	return true;
}

function defaultEntry(pageKey: HeroPageKey): StaticHeroEntry | null {
	if (pageKey === "prezent") {
		return {
			productImageUrl: PAGE_HERO_IMAGES.prezent.src,
			productImageAlt: PAGE_HERO_IMAGES.prezent.alt,
			productImageWidth: 1200,
			productImageHeight: 1500,
		};
	}
	return null;
}

async function syncHeroPage(
	pageKey: HeroPageKey,
	fields: HeroFields,
): Promise<StaticHeroEntry | null> {
	const remoteUrl = fields.productImageUrl?.trim();
	const filename = CMS_HERO_STATIC_FILES[pageKey];
	const localPath = `/images/cms/${filename}`;

	if (remoteUrl && isRemoteImageUrl(remoteUrl)) {
		fs.mkdirSync(CMS_IMAGES_DIR, { recursive: true });
		console.log(`  → ${pageKey}: ${filename}`);
		const ok = await downloadHeroImage(remoteUrl, filename);
		if (ok) {
			return {
				productImageUrl: localPath,
				productImageAlt:
					fields.productImageAlt?.trim() ||
					(pageKey === "prezent" ? PAGE_HERO_IMAGES.prezent.alt : "RetroHouse — hero"),
				productImageWidth: fields.productImageWidth ?? 1200,
				productImageHeight: fields.productImageHeight ?? 1500,
			};
		}
	}

	if (remoteUrl?.startsWith("/images/cms/")) {
		return {
			productImageUrl: remoteUrl,
			productImageAlt:
				fields.productImageAlt?.trim() ||
				(pageKey === "prezent" ? PAGE_HERO_IMAGES.prezent.alt : "RetroHouse — hero"),
			productImageWidth: fields.productImageWidth ?? 1200,
			productImageHeight: fields.productImageHeight ?? 1500,
		};
	}

	return defaultEntry(pageKey);
}

function writeStaticHeroFile(entries: Partial<Record<HeroPageKey, StaticHeroEntry>>): void {
	const content = `// Auto-generated by scripts/sync-cms-to-static.ts — DO NOT EDIT MANUALLY.
// Regenerowane przy każdym buildzie (prebuild).

export type StaticCmsHeroEntry = {
	productImageUrl: string;
	productImageAlt: string;
	productImageWidth: number;
	productImageHeight: number;
};

export const STATIC_CMS_HERO: Partial<Record<"home" | "prezent", StaticCmsHeroEntry>> = ${JSON.stringify(entries, null, "\t")};
`;
	fs.writeFileSync(STATIC_HERO_FILE, content, "utf-8");
	console.log(`\n✓ Zapisano ${path.relative(process.cwd(), STATIC_HERO_FILE)}`);
}

async function main() {
	console.log("🚀 Sync CMS hero → static...\n");

	try {
		const token = await getAdminToken();
		if (!token) {
			console.log("⚠ Sync pominięty — używane istniejące static-cms-hero.ts.\n");
			process.exit(0);
		}

		const pageContentMap = await fetchPageContentMap(token);
		const entries: Partial<Record<HeroPageKey, StaticHeroEntry>> = {};

		for (const pageKey of HERO_PAGES) {
			const fields = readHeroFields(pageContentMap, pageKey);
			const entry = await syncHeroPage(pageKey, fields);
			if (entry) entries[pageKey] = entry;
		}

		writeStaticHeroFile(entries);
		console.log(`\n✨ Sync hero zakończony (${Object.keys(entries).length} stron).\n`);
	} catch (error) {
		console.error("\n❌ Sync hero nieudany:", error);
		console.error("⚠ Build kontynuuje — używane istniejące fallbacki.\n");
		process.exit(0);
	}
}

main();
