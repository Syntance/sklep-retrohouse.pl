import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";
import { getCmsServiceToken, MEDUSA_BASE_URL } from "@/lib/admin/medusa-admin";
import { inferCmsMimeFromMeta, inferCmsMimeType } from "./cms-mime";
import { MAX_CMS_UPLOAD_BYTES, MAX_CMS_UPLOAD_MB, VERCEL_SAFE_UPLOAD_MB } from "./constants";
import { normalizeCmsImageFileToWebp } from "./normalize-cms-image.server";

type CmsUploadResult = {
	url: string;
	filename: string;
	size: number;
};

type CmsPresignedUpload = {
	uploadUrl: string;
	publicUrl: string;
};

let cachedR2: S3Client | null = null;

const R2_UPLOAD_TIMEOUT_MS = 15_000;
const LARGE_R2_UPLOAD_TIMEOUT_MS = 120_000;

async function withUploadTimeout<T>(
	promise: Promise<T>,
	label: string,
	timeoutMs = R2_UPLOAD_TIMEOUT_MS,
): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		return await Promise.race([
			promise,
			new Promise<never>((_, reject) => {
				timer = setTimeout(() => reject(new Error(`${label}_TIMEOUT`)), timeoutMs);
			}),
		]);
	} finally {
		if (timer) clearTimeout(timer);
	}
}

function getR2Config() {
	const endpoint = env.S3_ENDPOINT?.trim();
	const accessKeyId = env.S3_ACCESS_KEY_ID?.trim();
	const secretAccessKey = env.S3_SECRET_ACCESS_KEY?.trim();
	const bucket = env.S3_BUCKET?.trim();
	const fileUrl = env.S3_FILE_URL?.trim();

	if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !fileUrl) {
		return null;
	}
	return { endpoint, accessKeyId, secretAccessKey, bucket, fileUrl };
}

function getOrCreateR2Client(config: NonNullable<ReturnType<typeof getR2Config>>): S3Client {
	if (!cachedR2) {
		cachedR2 = new S3Client({
			region: env.S3_REGION?.trim() || "auto",
			endpoint: config.endpoint,
			forcePathStyle: true,
			credentials: {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
			},
		});
	}
	return cachedR2;
}

function buildCmsUploadKey(filename: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).slice(2, 8);
	const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
	return `cms-uploads/${timestamp}-${random}-${safeName}`;
}

async function uploadViaR2(
	file: File,
	config: NonNullable<ReturnType<typeof getR2Config>>,
	timeoutMs = R2_UPLOAD_TIMEOUT_MS,
): Promise<CmsUploadResult> {
	const key = buildCmsUploadKey(file.name);
	const contentType = inferCmsMimeType(file) ?? (file.type || "application/octet-stream");
	const body = new Uint8Array(await file.arrayBuffer());

	await withUploadTimeout(
		getOrCreateR2Client(config).send(
			new PutObjectCommand({
				Bucket: config.bucket,
				Key: key,
				Body: body,
				ContentLength: body.byteLength,
				ContentType: contentType,
			}),
		),
		"R2_UPLOAD",
		timeoutMs,
	);

	const base = config.fileUrl.replace(/\/$/, "");
	return { url: `${base}/${key}`, filename: file.name, size: file.size };
}

function resolveMedusaFileUrl(url: string): string {
	if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
	const base = MEDUSA_BASE_URL;
	return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

async function uploadViaMedusa(file: File): Promise<CmsUploadResult> {
	const token = await getCmsServiceToken();
	if (!token) throw new Error("MEDUSA_UPLOAD_UNAVAILABLE");

	const form = new FormData();
	form.append("files", file, file.name);

	const res = await fetch(`${MEDUSA_BASE_URL}/admin/uploads`, {
		method: "POST",
		headers: { Authorization: `Bearer ${token}` },
		body: form,
		signal: AbortSignal.timeout(120_000),
	});

	if (!res.ok) {
		throw new Error(`MEDUSA_UPLOAD_FAILED_${res.status}`);
	}

	const data = (await res.json()) as { files?: Array<{ url?: string }> };
	const url = data.files?.[0]?.url;
	if (!url) throw new Error("MEDUSA_UPLOAD_EMPTY");

	return {
		url: resolveMedusaFileUrl(url),
		filename: file.name,
		size: file.size,
	};
}

export function validateCmsUploadFile(file: File): string | null {
	if (file.size > MAX_CMS_UPLOAD_BYTES) {
		return `Plik jest za duży (maks. ${MAX_CMS_UPLOAD_MB} MB). Zapisz jako JPG/WebP lub zmniejsz rozdzielczość.`;
	}
	if (!inferCmsMimeType(file)) {
		return "Dozwolone formaty: JPG, PNG, WEBP, HEIC, GIF, AVIF.";
	}
	return null;
}

function validateCmsUploadMeta(filename: string, contentType: string, size: number): string | null {
	if (size > MAX_CMS_UPLOAD_BYTES) {
		return `Plik jest za duży (maks. ${MAX_CMS_UPLOAD_MB} MB). Zapisz jako JPG/WebP lub zmniejsz rozdzielczość.`;
	}
	if (size <= 0) return "Nieprawidłowy rozmiar pliku.";
	if (!inferCmsMimeFromMeta(filename, contentType)) {
		return "Dozwolone formaty: JPG, PNG, WEBP, HEIC, GIF, AVIF.";
	}
	return null;
}

export function formatCmsUploadError(error: unknown): string {
	if (!(error instanceof Error)) {
		return "Upload nie powiódł się. Spróbuj ponownie.";
	}

	const msg = error.message;
	if (msg.includes("Plik jest za duży") || msg.includes("Dozwolone formaty")) return msg;
	if (msg === "R2_UPLOAD_TIMEOUT") {
		return "Upload trwa zbyt długo. Spróbuj ponownie lub mniejszy plik (JPG/WebP).";
	}
	if (msg.startsWith("MEDUSA_UPLOAD_FAILED_413")) {
		return `Plik jest za duży dla serwera (maks. ${MAX_CMS_UPLOAD_MB} MB). Zapisz jako JPG/WebP.`;
	}
	if (msg.startsWith("MEDUSA_UPLOAD_FAILED_")) {
		return `Serwer odrzucił plik. Spróbuj JPG/WebP do ${MAX_CMS_UPLOAD_MB} MB.`;
	}
	if (msg === "R2_UPLOAD_FAILED" || msg.endsWith("_TIMEOUT")) {
		return "Upload do magazynu plików nie powiódł się. Spróbuj ponownie.";
	}
	if (msg === "R2_PRESIGN_UNAVAILABLE") {
		return `Pliki powyżej ${VERCEL_SAFE_UPLOAD_MB} MB wymagają R2 (S3_* na Vercel). Zmniejsz plik lub skonfiguruj magazyn.`;
	}
	if (msg === "MEDUSA_UPLOAD_UNAVAILABLE") {
		return "Magazyn plików niedostępny. Ustaw S3/R2 (S3_*) na Vercel lub MEDUSA_ADMIN_EMAIL + MEDUSA_ADMIN_PASSWORD.";
	}
	if (msg.startsWith("MEDUSA_")) {
		return `Upload nie powiódł się. Spróbuj JPG/WebP do ${MAX_CMS_UPLOAD_MB} MB.`;
	}
	return msg;
}

/** Assety CMS (hero) — R2 z timeoutem; fallback Medusa gdy R2 niedostępne. */
export async function uploadCmsAssetFile(file: File): Promise<CmsUploadResult> {
	const validationError = validateCmsUploadFile(file);
	if (validationError) throw new Error(validationError);

	const normalized = await normalizeCmsImageFileToWebp(file);
	const normalizedValidation = validateCmsUploadFile(normalized);
	if (normalizedValidation) throw new Error(normalizedValidation);

	const r2 = getR2Config();
	if (r2) {
		try {
			return await uploadViaR2(normalized, r2, LARGE_R2_UPLOAD_TIMEOUT_MS);
		} catch (error) {
			try {
				return await uploadViaMedusa(normalized);
			} catch {
				if (error instanceof Error && error.message === "R2_UPLOAD_TIMEOUT") {
					throw new Error(
						"Upload do R2 trwa zbyt długo. Sprawdź połączenie lub spróbuj mniejszego pliku (WebP/JPG).",
					);
				}
				throw error instanceof Error ? error : new Error("R2_UPLOAD_FAILED");
			}
		}
	}

	return uploadViaMedusa(normalized);
}

/** Presigned PUT — upload z przeglądarki prosto do R2 (omija limit body Vercel ~4.5 MB). */
export async function createCmsPresignedUpload(params: {
	filename: string;
	contentType: string;
	size: number;
}): Promise<CmsPresignedUpload> {
	const validationError = validateCmsUploadMeta(params.filename, params.contentType, params.size);
	if (validationError) throw new Error(validationError);

	const r2 = getR2Config();
	if (!r2) throw new Error("R2_PRESIGN_UNAVAILABLE");

	const resolvedType = inferCmsMimeFromMeta(params.filename, params.contentType);
	if (!resolvedType) throw new Error("Dozwolone formaty: JPG, PNG, WEBP, HEIC, GIF, AVIF.");

	const key = buildCmsUploadKey(params.filename);
	const client = getOrCreateR2Client(r2);

	const uploadUrl = await getSignedUrl(
		client,
		new PutObjectCommand({
			Bucket: r2.bucket,
			Key: key,
			ContentType: resolvedType,
			ContentLength: params.size,
		}),
		{ expiresIn: 600 },
	);

	const base = r2.fileUrl.replace(/\/$/, "");
	return { uploadUrl, publicUrl: `${base}/${key}` };
}
