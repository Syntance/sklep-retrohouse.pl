import "server-only";

import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@/env";
import { cmsR2PublicBaseUrl } from "@/lib/content/cms-media-url";

let client: S3Client | null = null;

export function isR2UploadConfigured(): boolean {
	return Boolean(
		env.S3_ENDPOINT &&
			env.S3_BUCKET &&
			env.S3_ACCESS_KEY_ID &&
			env.S3_SECRET_ACCESS_KEY &&
			cmsR2PublicBaseUrl(),
	);
}

function publicBaseUrl(): string {
	const base = cmsR2PublicBaseUrl();
	if (!base) {
		throw new Error("Brak publicznego URL R2 (S3_FILE_URL / S3_PUBLIC_URL / NEXT_PUBLIC_MEDIA_CDN_URL).");
	}
	return base;
}

function getR2Client(): S3Client {
	if (!client) {
		client = new S3Client({
			region: env.S3_REGION ?? "auto",
			endpoint: env.S3_ENDPOINT,
			credentials: {
				accessKeyId: env.S3_ACCESS_KEY_ID!,
				secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
			},
		});
	}
	return client;
}

export async function uploadBufferToR2(
	buffer: Buffer,
	filename: string,
	contentType: string,
	prefix = "cms",
): Promise<string> {
	const key = `${prefix}/${randomUUID()}-${filename}`;
	await getR2Client().send(
		new PutObjectCommand({
			Bucket: env.S3_BUCKET,
			Key: key,
			Body: buffer,
			ContentType: contentType,
		}),
	);
	return `${publicBaseUrl()}/${key}`;
}

export async function uploadFilesToR2(files: File[], prefix = "cms"): Promise<string[]> {
	const urls: string[] = [];
	for (const file of files) {
		const buffer = Buffer.from(await file.arrayBuffer());
		urls.push(
			await uploadBufferToR2(
				buffer,
				file.name || "upload.webp",
				file.type || "application/octet-stream",
				prefix,
			),
		);
	}
	return urls;
}
