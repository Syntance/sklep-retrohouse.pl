import { resolveMedusaMediaUrl, resolveMedusaMediaUrls } from "@/lib/medusa/media-url";
import { categoryLabel, HUE_TRIADS, PRODUCT_CATEGORY_VALUES } from "@/lib/products/constants";
import { type EpochOption, epochLabelFor } from "@/lib/products/epoch-types";
import type { Product, ProductBadge, ProductCategory, ProductDefect } from "@/lib/products/types";

type MedusaVariant = {
	id?: string;
	calculated_price?: {
		calculated_amount?: number;
		currency_code?: string;
	} | null;
	prices?: Array<{ amount?: number; currency_code?: string }> | null;
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

function parseEpoch(raw: string | undefined, options: EpochOption[]): string {
	if (raw?.trim()) return raw.trim();
	return options.find((option) => option.value === "inne")?.value ?? options[0]?.value ?? "inne";
}

function parseBadges(raw: string | undefined): ProductBadge[] {
	if (!raw) return [];
	const allowed: ProductBadge[] = ["unikat", "fresh", "bestseller"];
	return raw
		.split(",")
		.map((part) => part.trim())
		.filter((part): part is ProductBadge => allowed.includes(part as ProductBadge));
}

function parseDefects(raw: string | undefined): ProductDefect[] {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed
			.map((item): ProductDefect | null => {
				if (typeof item === "string") return item.trim() ? { label: item.trim() } : null;
				if (item && typeof item === "object") {
					const obj = item as Record<string, unknown>;
					const label = typeof obj.label === "string" ? obj.label.trim() : "";
					const note = typeof obj.note === "string" ? obj.note.trim() : "";
					return label ? { label, note: note || undefined } : null;
				}
				return null;
			})
			.filter((item): item is ProductDefect => item !== null);
	} catch {
		return [];
	}
}

/** Sklep = wyłącznie PLN; bierzemy cenę pln z wariantu, nie calculated_price w EUR. */
function singleVariantPrice(product: MedusaStoreProduct): {
	amount: number;
	currency: string;
	variantId?: string;
} {
	const variant = product.variants?.[0];
	const plnPrice = variant?.prices?.find((p) => p.currency_code === "pln");

	if (plnPrice?.amount != null) {
		return { amount: plnPrice.amount, currency: "pln", variantId: variant?.id };
	}

	const calc = variant?.calculated_price;
	return {
		amount: calc?.calculated_amount ?? 0,
		currency: "pln",
		variantId: variant?.id,
	};
}

export function mapMedusaProduct(
	product: MedusaStoreProduct,
	epochOptions: EpochOption[],
): Product | null {
	if (!product.handle) return null;

	const metadata = product.metadata ?? {};
	const category = parseCategoryFromMedusa(metaString(metadata, "category"), product.categories);
	const epoch = parseEpoch(metaString(metadata, "epoch"), epochOptions);
	const rawImages =
		product.images?.map((image) => image.url).filter((url): url is string => Boolean(url)) ?? [];
	const resolvedImages = [
		resolveMedusaMediaUrl(product.thumbnail),
		...resolveMedusaMediaUrls(rawImages),
	].filter((url): url is string => Boolean(url));
	const images = [...new Set(resolvedImages)];
	const thumbnail = images[0];
	const { amount, currency, variantId } = singleVariantPrice(product);
	const description = product.description?.trim() ?? "";
	const fallbackShort =
		(description.length > 160 ? `${description.slice(0, 157)}…` : description) ||
		product.title ||
		"";
	const shortDescription = metaString(metadata, "shortDescription") ?? fallbackShort;

	return {
		medusaId: product.id,
		medusaVariantId: variantId,
		slug: product.handle,
		name: product.title ?? product.handle,
		price: amount,
		currencyCode: currency,
		category,
		categoryLabel: categoryLabel(category),
		epoch,
		epochLabel: epochLabelFor(epoch, epochOptions),
		manufacturer: metaString(metadata, "manufacturer") ?? product.subtitle ?? "—",
		signature: metaString(metadata, "signature"),
		dimensions: metaString(metadata, "dimensions") ?? "—",
		condition: metaString(metadata, "condition") ?? "Stan do weryfikacji w sklepie.",
		badges: parseBadges(metaString(metadata, "badges")),
		defects: parseDefects(metaString(metadata, "defects")),
		pickupOnly: metaString(metadata, "delivery") === "pickup_only",
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
