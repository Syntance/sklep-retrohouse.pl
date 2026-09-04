import "server-only";
import { cache } from "react";
import { getEpochOptions } from "@/lib/catalog/epochs";
import { isMedusaBackendHealthy } from "@/lib/medusa/backend-health";
import { getMedusaClient } from "@/lib/medusa/client";
import { isMedusaConfigured } from "@/lib/medusa/is-medusa-configured";
import { type MedusaStoreProduct, mapMedusaProduct } from "@/lib/products/map-from-medusa";
import { DEV_MOCK_PRODUCTS } from "@/lib/products/mock-catalog";
import type { Product } from "@/lib/products/types";

const PRODUCT_FIELDS =
	"*variants,+variants.calculated_price,+variants.prices,+metadata,+categories,*images";

let devMockWarned = false;
let medusaUnavailableWarned = false;

function warnDevMockCatalog(): void {
	if (process.env.NODE_ENV !== "development" || devMockWarned) return;
	devMockWarned = true;
	console.warn(
		"[retrohouse] Brak NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY — katalog demo. Dodaj pk_… do .env.local.",
	);
}

function warnMedusaUnavailable(message: string): void {
	if (medusaUnavailableWarned) return;
	medusaUnavailableWarned = true;
	console.warn(`[retrohouse] ${message}`);
}

const getDefaultRegionId = cache(async (): Promise<string> => {
	if (!(await isMedusaBackendHealthy())) return "";

	const medusa = getMedusaClient();
	if (!medusa) return "";
	try {
		const { regions } = await medusa.store.region.list();
		const pln = regions.find(
			(region: { currency_code?: string | null }) => region.currency_code === "pln",
		);
		return pln?.id ?? regions[0]?.id ?? "";
	} catch (error) {
		warnMedusaUnavailable(
			`Medusa region.list nieudane: ${error instanceof Error ? error.message : "nieznany błąd"}`,
		);
		return "";
	}
});

export const listProducts = cache(async (): Promise<Product[]> => {
	if (!isMedusaConfigured()) {
		warnDevMockCatalog();
		return DEV_MOCK_PRODUCTS;
	}

	const medusa = getMedusaClient();
	if (!medusa) return DEV_MOCK_PRODUCTS;
	if (!(await isMedusaBackendHealthy())) return [];

	try {
		const [regionId, epochOptions] = await Promise.all([getDefaultRegionId(), getEpochOptions()]);
		const { products } = await medusa.store.product.list({
			limit: 100,
			region_id: regionId || undefined,
			fields: PRODUCT_FIELDS,
		});

		return products
			.map((product: MedusaStoreProduct) => mapMedusaProduct(product, epochOptions))
			.filter((product: Product | null): product is Product => product !== null);
	} catch (error) {
		warnMedusaUnavailable(
			`Medusa product.list nieudane: ${error instanceof Error ? error.message : "nieznany błąd"}`,
		);
		return [];
	}
});

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
	if (!isMedusaConfigured()) {
		return DEV_MOCK_PRODUCTS.find((product) => product.slug === slug);
	}

	const medusa = getMedusaClient();
	if (!medusa) return undefined;
	if (!(await isMedusaBackendHealthy())) return undefined;

	try {
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
	} catch (error) {
		warnMedusaUnavailable(
			`Medusa product.list(${slug}) nieudane: ${error instanceof Error ? error.message : "nieznany błąd"}`,
		);
		return undefined;
	}
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
