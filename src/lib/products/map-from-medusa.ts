import {
	categoryLabel,
	epochLabel,
	HUE_TRIADS,
	PRODUCT_CATEGORY_VALUES,
	PRODUCT_EPOCH_VALUES,
} from "@/lib/products/constants";
import { resolveMedusaMediaUrl, resolveMedusaMediaUrls } from "@/lib/medusa/media-url";
import type {
	Product,
	ProductBadge,
	ProductCategory,
	ProductEpoch,
} from "@/lib/products/types";

type MedusaVariant = {
	calculated_price?: {
		calculated_amount?: number;
		currency_code?: string;
	} | null;
};

type MedusaStoreProduct = {
	id: string;
	title?: string | null;
	handle?: string | null;
	description?: string | null;
	subtitle?: string | null;
	thumbnail?: string | null;
	created_at?: string;
	metadata?: Record<string, unknown> | null;
	images?: Array<{ url?: string | null }> | null;
	categories?: Array<{ handle?: string | null; name?: string | null }> | null;
	variants?: MedusaVariant[] | null;
};

function metaString(metadata: Record<string, unknown>, key: string): string | undefined {
	const value = metadata[key];
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function parseCategory(raw: string | undefined): ProductCategory {
	if (raw && PRODUCT_CATEGORY_VALUES.includes(raw as ProductCategory)) {
		return raw as ProductCategory;
	}
	return "inne";
}

function parseCategoryFromMedusa(
	rawMetadata: string | undefined,
	categories: MedusaStoreProduct["categories"],
): ProductCategory {
	const categoryHandle = categories?.[0]?.handle ?? undefined;
	if (categoryHandle && PRODUCT_CATEGORY_VALUES.includes(categoryHandle as ProductCategory)) {
		return categoryHandle as ProductCategory;
	}
	return parseCategory(rawMetadata);
}

function parseEpoch(raw: string | undefined): ProductEpoch {
	if (raw && PRODUCT_EPOCH_VALUES.includes(raw as ProductEpoch)) {
		return raw as ProductEpoch;
	}
	return "inne";
}

function parseBadges(raw: string | undefined): ProductBadge[] {
	if (!raw) return [];
	const allowed: ProductBadge[] = ["unikat", "fresh", "bestseller"];
	return raw
		.split(",")
		.map((part) => part.trim())
		.filter((part): part is ProductBadge => allowed.includes(part as ProductBadge));
}

function lowestPrice(product: MedusaStoreProduct): { amount: number; currency: string } {
	const variants = product.variants ?? [];
	let amount = 0;
	let currency = "eur";

	for (const variant of variants) {
		const calc = variant.calculated_price;
		if (!calc?.calculated_amount) continue;
		if (amount === 0 || calc.calculated_amount < amount) {
			amount = calc.calculated_amount;
			currency = calc.currency_code ?? currency;
		}
	}

	return { amount, currency };
}

export function mapMedusaProduct(product: MedusaStoreProduct): Product | null {
	if (!product.handle) return null;

	const metadata = product.metadata ?? {};
	const category = parseCategoryFromMedusa(metaString(metadata, "category"), product.categories);
	const epoch = parseEpoch(metaString(metadata, "epoch"));
	const rawImages =
		product.images?.map((image) => image.url).filter((url): url is string => Boolean(url)) ?? [];
	const resolvedImages = [
		resolveMedusaMediaUrl(product.thumbnail),
		...resolveMedusaMediaUrls(rawImages),
	].filter((url): url is string => Boolean(url));
	const images = [...new Set(resolvedImages)];
	const thumbnail = images[0];
	const { amount, currency } = lowestPrice(product);
	const description = product.description?.trim() ?? "";
	const fallbackShort =
		(description.length > 160 ? `${description.slice(0, 157)}…` : description) ||
		product.title ||
		"";
	const shortDescription = metaString(metadata, "shortDescription") ?? fallbackShort;

	return {
		medusaId: product.id,
		slug: product.handle,
		name: product.title ?? product.handle,
		price: amount,
		currencyCode: currency,
		category,
		categoryLabel: categoryLabel(category),
		epoch,
		epochLabel: epochLabel(epoch),
		manufacturer: metaString(metadata, "manufacturer") ?? product.subtitle ?? "—",
		signature: metaString(metadata, "signature"),
		dimensions: metaString(metadata, "dimensions") ?? "—",
		condition: metaString(metadata, "condition") ?? "Stan do weryfikacji w sklepie.",
		badges: parseBadges(metaString(metadata, "badges")),
		addedAt: product.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
		story: metaString(metadata, "story") ?? description,
		shortDescription,
		imageHues: HUE_TRIADS[category],
		imageUrl: thumbnail,
		images,
		popularity: Number(metaString(metadata, "popularity") ?? "0") || 0,
		giftBestseller: metaString(metadata, "giftBestseller") === "true",
	};
}

export type { MedusaStoreProduct };
