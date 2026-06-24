import "server-only";

import { normalizeCmsImageToWebp } from "@/lib/content/normalize-cms-image";
import { isCmsUploadImage } from "@/lib/content/image-file";
import { inferCmsMimeType } from "./cms-mime";

const SKIP_WEBP_CONVERSION = new Set(["image/gif", "image/svg+xml", "image/webp"]);

export async function normalizeCmsImageFileToWebp(file: File): Promise<File> {
	if (!isCmsUploadImage(file)) {
		throw new Error("Dozwolone są zdjęcia JPG, PNG, HEIC lub WebP (bez SVG).");
	}

	const mime = inferCmsMimeType(file);
	if (!mime || SKIP_WEBP_CONVERSION.has(mime)) {
		return file;
	}

	const webp = await normalizeCmsImageToWebp(Buffer.from(await file.arrayBuffer()));
	const baseName = file.name.replace(/\.[^.]+$/, "") || "cms";
	return new File([new Uint8Array(webp)], `${baseName}.webp`, { type: "image/webp" });
}
