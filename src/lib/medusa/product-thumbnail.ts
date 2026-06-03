import { resolveMedusaMediaUrl, resolveMedusaMediaUrls } from "@/lib/medusa/media-url";

export type MedusaProductMedia = {
	thumbnail?: string | null;
	images?: Array<{ url?: string | null }> | null;
};

/** Miniatura produktu: thumbnail lub pierwsze zdjęcie z galerii (po resolve URL). */
export function resolveProductThumbnailUrl(product: MedusaProductMedia): string | null {
	const rawImages = (product.images ?? [])
		.map((img) => img.url)
		.filter((url): url is string => Boolean(url));
	const resolved = [
		resolveMedusaMediaUrl(product.thumbnail),
		...resolveMedusaMediaUrls(rawImages),
	].filter((url): url is string => Boolean(url));

	return resolved.length > 0 ? resolved[0] : null;
}

export function resolveLineItemThumbnailUrl(
	lineThumbnail: string | null | undefined,
	productFallback: string | null | undefined,
): string | null {
	const fromLine = resolveMedusaMediaUrl(lineThumbnail?.trim() ? lineThumbnail : undefined);
	if (fromLine) return fromLine;
	return productFallback ?? null;
}
