import sharp from "sharp";
import { CMS_HERO_MAX_LONG_EDGE, CMS_HERO_WEBP_QUALITY } from "./cms-hero-image";

/** Konwersja CMS → WebP (EXIF rotate, max bok, q92 — wizualnie bez strat, mniejszy plik). */
export async function normalizeCmsImageToWebp(input: Buffer): Promise<Buffer> {
	return sharp(input)
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

function isSvgFile(file: File): boolean {
	return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
}

/** Przygotowuje plik z panelu CMS do uploadu (zawsze WebP). */
export async function prepareCmsUploadFile(file: File): Promise<File> {
	if (!file.type.startsWith("image/")) {
		throw new Error("Dozwolone są tylko pliki graficzne.");
	}
	if (isSvgFile(file)) {
		throw new Error("SVG nie jest obsługiwany — użyj JPG, PNG lub WebP.");
	}

	const optimized = await normalizeCmsImageToWebp(Buffer.from(await file.arrayBuffer()));
	return new File([new Uint8Array(optimized)], cmsUploadFileName(file.name), {
		type: "image/webp",
	});
}

export async function prepareCmsUploadFiles(files: File[]): Promise<File[]> {
	return Promise.all(files.map((file) => prepareCmsUploadFile(file)));
}
