import sharp from "sharp";
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
