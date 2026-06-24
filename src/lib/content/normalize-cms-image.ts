import sharp from "sharp";
import { isCmsUploadImage } from "./image-file";
import { CMS_HERO_MAX_LONG_EDGE, CMS_HERO_WEBP_QUALITY } from "./cms-hero-image";

/** Konwersja CMS → WebP (EXIF rotate, max bok, q92 — wizualnie bez strat, mniejszy plik). */
export async function normalizeCmsImageToWebp(input: Buffer): Promise<Buffer> {
	return sharp(input, { failOn: "none", limitInputPixels: false })
		.rotate()
		.resize(CMS_HERO_MAX_LONG_EDGE, CMS_HERO_MAX_LONG_EDGE, {
			fit: "inside",
			withoutEnlargement: true,
		})
		.webp({
			quality: CMS_HERO_WEBP_QUALITY,
			effort: 4,
			smartSubsample: true,
		})
		.toBuffer();
}

export function cmsUploadFileName(originalName: string): string {
	const stem =
		originalName
			.replace(/\.[^.]+$/, "")
			.replace(/[^\w.-]+/g, "-")
			.replace(/^-+|-+$/g, "") || "cms-image";
	return `${stem}.webp`;
}

/** Przygotowuje plik z panelu CMS do uploadu (HEIC/JPG/PNG → WebP przed Medusą). */
export async function prepareCmsUploadFile(file: File): Promise<File> {
	if (!isCmsUploadImage(file)) {
		throw new Error("Dozwolone są zdjęcia JPG, PNG, HEIC lub WebP (bez SVG).");
	}

	let optimized: Buffer;
	try {
		optimized = await normalizeCmsImageToWebp(Buffer.from(await file.arrayBuffer()));
	} catch {
		throw new Error("Nie udało się przetworzyć zdjęcia. Spróbuj ponownie lub inny plik.");
	}

	return new File([new Uint8Array(optimized)], cmsUploadFileName(file.name), {
		type: "image/webp",
	});
}

export async function prepareCmsUploadFiles(files: File[]): Promise<File[]> {
	return Promise.all(files.map((file) => prepareCmsUploadFile(file)));
}
