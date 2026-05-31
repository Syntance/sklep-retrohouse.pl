import "server-only";
import { cache } from "react";
import { getEpochOptions } from "@/lib/catalog/epochs";
import { medusa } from "@/lib/medusa/client";
import { mapMedusaProduct, type MedusaStoreProduct } from "@/lib/products/map-from-medusa";
import type { Product } from "@/lib/products/types";

const PRODUCT_FIELDS =
	"*variants,+variants.calculated_price,+variants.prices,+metadata,+categories,*images";

export const getDefaultRegionId = cache(async (): Promise<string> => {
	const { regions } = await medusa.store.region.list();
	// Sklep sprzedaje w PLN — preferuj region złotówkowy (na backendzie istnieje też EUR).
	const pln = regions.find((region: { currency_code?: string | null }) => region.currency_code === "pln");
	return pln?.id ?? regions[0]?.id ?? "";
});

export const listProducts = cache(async (): Promise<Product[]> => {
	const [regionId, epochOptions] = await Promise.all([getDefaultRegionId(), getEpochOptions()]);
	const { products } = await medusa.store.product.list({
		limit: 100,
		region_id: regionId || undefined,
		fields: PRODUCT_FIELDS,
	});

	return products
		.map((product: MedusaStoreProduct) => mapMedusaProduct(product, epochOptions))
		.filter((product: Product | null): product is Product => product !== null);
});

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
	const [regionId, epochOptions] = await Promise.all([getDefaultRegionId(), getEpochOptions()]);
	const { products } = await medusa.store.product.list({
		handle: slug,
		limit: 1,
		region_id: regionId || undefined,
		fields: PRODUCT_FIELDS,
	});

	const mapped = products
		.map((product: MedusaStoreProduct) => mapMedusaProduct(product, epochOptions))
		.filter((product: Product | null): product is Product => product !== null);

	return mapped[0];
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
	if (slugs.length === 0) return [];

	const all = await listProducts();
	const wanted = new Set(slugs);
	return all.filter((product) => wanted.has(product.slug));
}

export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
	const current = await getProductBySlug(slug);
	const all = await listProducts();
	if (!current) return all.slice(0, limit);

	return all
		.filter(
			(product) =>
				product.slug !== slug &&
				(product.category === current.category || product.epoch === current.epoch),
		)
		.slice(0, limit);
}

export async function getProductSlugs(): Promise<string[]> {
	const products = await listProducts();
	return products.map((product) => product.slug);
}
