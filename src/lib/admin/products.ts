import "server-only";
import { partitionReachableMediaUrls } from "@/lib/admin/media-check";
import { resolveMedusaMediaUrls } from "@/lib/medusa/media-url";
import { resolveProductThumbnailUrl } from "@/lib/medusa/product-thumbnail";
import { adminFetch } from "./medusa-admin";
import { getStoreConfig } from "./store-config";

export type DefectItem = { label: string; note: string };

export type ProductStatus = "draft" | "published";

/** Wartości formularza produktu — wspólne dla dodawania i edycji. */
export type ProductFormValues = {
	title: string;
	handle: string;
	status: ProductStatus;
	categoryId: string | null;
	description: string;
	shortDescription: string;
	story: string;
	manufacturer: string;
	epoch: string;
	signature: string;
	dimensions: string;
	condition: string;
	defects: DefectItem[];
	/** true = tylko odbiór osobisty (bez wysyłki). */
	pickupOnly: boolean;
	pricePln: number | null;
	images: string[];
	badges: string[];
	popularity: number;
	giftBestseller: boolean;
};

export type AdminProductRow = {
	id: string;
	title: string;
	handle: string;
	status: ProductStatus;
	thumbnail: string | null;
	categoryName: string | null;
	pricePln: number | null;
};

export type AdminProductDetail = ProductFormValues & {
	id: string;
	variantId: string | null;
	/** Zdjęcia w bazie, których pliki już nie ma na serwerze Medusa. */
	staleImageCount: number;
};

type MedusaPrice = { currency_code: string; amount: number };
type MedusaVariant = { id: string; prices?: MedusaPrice[] | null };
type MedusaProduct = {
	id: string;
	title: string;
	handle: string;
	status: ProductStatus;
	description?: string | null;
	thumbnail?: string | null;
	metadata?: Record<string, unknown> | null;
	images?: Array<{ url?: string | null }> | null;
	categories?: Array<{ id: string; name: string }> | null;
	variants?: MedusaVariant[] | null;
};

function priceOf(variant: MedusaVariant | undefined, currency: string): number | null {
	const price = variant?.prices?.find((p) => p.currency_code === currency);
	return price ? price.amount : null;
}

function metaString(metadata: Record<string, unknown> | null | undefined, key: string): string {
	const value = metadata?.[key];
	return typeof value === "string" ? value : "";
}

function parseDefects(raw: string): DefectItem[] {
	if (!raw.trim()) return [];
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed
			.map((item) => {
				if (typeof item === "string") return { label: item, note: "" };
				if (item && typeof item === "object") {
					const obj = item as Record<string, unknown>;
					return {
						label: typeof obj.label === "string" ? obj.label : "",
						note: typeof obj.note === "string" ? obj.note : "",
					};
				}
				return { label: "", note: "" };
			})
			.filter((item) => item.label.trim().length > 0);
	} catch {
		return [];
	}
}

const LIST_FIELDS =
	"id,title,handle,status,thumbnail,images.url,categories.id,categories.name,variants.prices.amount,variants.prices.currency_code";

const DETAIL_FIELDS =
	"id,title,handle,status,description,thumbnail,images.url,metadata,categories.id,categories.name,variants.id,variants.prices.amount,variants.prices.currency_code";

function resolveAdminProductThumbnail(product: MedusaProduct): string | null {
	return resolveProductThumbnailUrl(product);
}

export async function listAdminProducts(): Promise<AdminProductRow[]> {
	const data = await adminFetch<{ products: MedusaProduct[] }>(
		`/admin/products?limit=200&fields=${LIST_FIELDS}`,
	);

	return data.products.map((product) => {
		const variant = product.variants?.[0];
		return {
			id: product.id,
			title: product.title,
			handle: product.handle,
			status: product.status,
			thumbnail: resolveAdminProductThumbnail(product),
			categoryName: product.categories?.[0]?.name ?? null,
			pricePln: priceOf(variant, "pln"),
		};
	});
}

export async function getAdminProduct(id: string): Promise<AdminProductDetail | null> {
	const data = await adminFetch<{ product: MedusaProduct }>(
		`/admin/products/${id}?fields=${DETAIL_FIELDS}`,
	);
	const product = data.product;
	if (!product) return null;

	const variant = product.variants?.[0];
	const metadata = product.metadata ?? {};
	const popularityRaw = metaString(metadata, "popularity");
	const badgesRaw = metaString(metadata, "badges");
	const rawImageUrls = (product.images ?? [])
		.map((img) => img.url)
		.filter((url): url is string => Boolean(url));
	const { valid: images, staleCount: staleImageCount } =
		await partitionReachableMediaUrls(rawImageUrls);

	return {
		id: product.id,
		variantId: variant?.id ?? null,
		title: product.title,
		handle: product.handle,
		status: product.status,
		categoryId: product.categories?.[0]?.id ?? null,
		description: product.description ?? "",
		shortDescription: metaString(metadata, "shortDescription"),
		story: metaString(metadata, "story"),
		manufacturer: metaString(metadata, "manufacturer"),
		epoch: metaString(metadata, "epoch"),
		signature: metaString(metadata, "signature"),
		dimensions: metaString(metadata, "dimensions"),
		condition: metaString(metadata, "condition"),
		defects: parseDefects(metaString(metadata, "defects")),
		pickupOnly: metaString(metadata, "delivery") === "pickup_only",
		pricePln: priceOf(variant, "pln"),
		images,
		staleImageCount,
		badges: badgesRaw
			? badgesRaw
					.split(",")
					.map((b) => b.trim())
					.filter(Boolean)
			: [],
		popularity: Number(popularityRaw) || 0,
		giftBestseller: metaString(metadata, "giftBestseller") === "true",
	};
}

function buildMetadata(values: ProductFormValues): Record<string, string> {
	const defects = values.defects
		.map((d) => ({ label: d.label.trim(), note: d.note.trim() }))
		.filter((d) => d.label.length > 0);

	return {
		shortDescription: values.shortDescription.trim(),
		story: values.story.trim(),
		manufacturer: values.manufacturer.trim(),
		epoch: values.epoch.trim(),
		signature: values.signature.trim(),
		dimensions: values.dimensions.trim(),
		condition: values.condition.trim(),
		delivery: values.pickupOnly ? "pickup_only" : "shipping",
		badges: values.badges.join(","),
		popularity: String(values.popularity || 0),
		giftBestseller: values.giftBestseller ? "true" : "false",
		defects: defects.length > 0 ? JSON.stringify(defects) : "",
	};
}

function buildPrices(values: ProductFormValues): MedusaPrice[] {
	if (values.pricePln == null) return [];
	return [{ currency_code: "pln", amount: values.pricePln }];
}

export async function createAdminProduct(values: ProductFormValues): Promise<string> {
	const { salesChannelId, shippingProfileId } = await getStoreConfig();

	const body: Record<string, unknown> = {
		title: values.title.trim(),
		handle: values.handle.trim(),
		status: values.status,
		description: values.description.trim(),
		metadata: buildMetadata(values),
		images: resolveMedusaMediaUrls(values.images).map((url) => ({ url })),
		options: [{ title: "Typ", values: ["Unikat"] }],
		variants: [
			{
				title: "Unikat",
				options: { Typ: "Unikat" },
				manage_inventory: false,
				prices: buildPrices(values),
			},
		],
	};

	if (values.categoryId) body.categories = [{ id: values.categoryId }];
	if (shippingProfileId) body.shipping_profile_id = shippingProfileId;
	if (salesChannelId) body.sales_channels = [{ id: salesChannelId }];

	const data = await adminFetch<{ product: { id: string } }>("/admin/products", {
		method: "POST",
		body: JSON.stringify(body),
	});
	return data.product.id;
}

export async function updateAdminProduct(
	id: string,
	variantId: string | null,
	values: ProductFormValues,
): Promise<void> {
	const body: Record<string, unknown> = {
		title: values.title.trim(),
		handle: values.handle.trim(),
		status: values.status,
		description: values.description.trim(),
		metadata: buildMetadata(values),
		images: resolveMedusaMediaUrls(values.images).map((url) => ({ url })),
		categories: values.categoryId ? [{ id: values.categoryId }] : [],
	};

	await adminFetch(`/admin/products/${id}`, { method: "POST", body: JSON.stringify(body) });

	if (variantId) {
		await adminFetch(`/admin/products/${id}/variants/${variantId}`, {
			method: "POST",
			body: JSON.stringify({ prices: buildPrices(values) }),
		});
	}
}

export async function deleteAdminProduct(id: string): Promise<void> {
	await adminFetch(`/admin/products/${id}`, { method: "DELETE" });
}

/**
 * Powiela produkt: kopiuje wszystkie pola + metadane, tworzy szkic z unikalnym
 * handle (antyki to unikaty — kopia startuje jako draft do edycji).
 */
export async function duplicateAdminProduct(id: string): Promise<string> {
	const source = await getAdminProduct(id);
	if (!source) throw new Error("Nie znaleziono produktu do powielenia.");

	return createAdminProduct({
		...source,
		title: `${source.title} (kopia)`,
		handle: `${source.handle}-kopia-${Date.now().toString(36)}`,
		status: "draft",
	});
}
