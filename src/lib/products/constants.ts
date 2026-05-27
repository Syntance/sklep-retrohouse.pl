import type { ProductCategory, ProductEpoch } from "@/lib/products/types";

export const HUE_TRIADS: Record<ProductCategory, [string, string, string]> = {
	porcelana: ["oklch(0.92 0.02 80)", "oklch(0.74 0.10 80)", "oklch(0.39 0.07 45)"],
	szklo: ["oklch(0.86 0.03 75)", "oklch(0.55 0.08 50)", "oklch(0.39 0.07 45)"],
	dekoracje: ["oklch(0.78 0.06 60)", "oklch(0.55 0.08 60)", "oklch(0.27 0.005 280)"],
	meble: ["oklch(0.68 0.07 50)", "oklch(0.52 0.15 38)", "oklch(0.27 0.005 280)"],
	obrazy: ["oklch(0.84 0.04 90)", "oklch(0.60 0.06 50)", "oklch(0.27 0.005 280)"],
	inne: ["oklch(0.86 0.025 70)", "oklch(0.62 0.06 55)", "oklch(0.34 0.04 45)"],
};

export function categoryLabel(category: ProductCategory): string {
	switch (category) {
		case "porcelana":
			return "Porcelana";
		case "szklo":
			return "Szkło";
		case "dekoracje":
			return "Dekoracje";
		case "meble":
			return "Meble";
		case "obrazy":
			return "Obrazy";
		case "inne":
			return "Inne";
	}
}

export function epochLabel(epoch: ProductEpoch): string {
	switch (epoch) {
		case "secesja":
			return "Secesja";
		case "art-deco":
			return "Art Deco";
		case "lata-50":
			return "Lata 50.";
		case "lata-60-70":
			return "Lata 60.–70.";
		case "inne":
			return "Inne";
	}
}

export const PRODUCT_CATEGORIES: Array<{
	value: ProductCategory;
	label: string;
}> = [
	{ value: "porcelana", label: "Porcelana" },
	{ value: "szklo", label: "Szkło" },
	{ value: "dekoracje", label: "Dekoracje" },
	{ value: "meble", label: "Meble" },
	{ value: "obrazy", label: "Obrazy" },
	{ value: "inne", label: "Inne" },
];

export const PRODUCT_EPOCHS: Array<{ value: ProductEpoch; label: string }> = [
	{ value: "secesja", label: "Secesja" },
	{ value: "art-deco", label: "Art Deco" },
	{ value: "lata-50", label: "Lata 50." },
	{ value: "lata-60-70", label: "Lata 60.–70." },
	{ value: "inne", label: "Inne" },
];

export const PRICE_BUCKETS: Array<{
	id: string;
	label: string;
	min: number;
	max?: number;
}> = [
	{ id: "do-100", label: "do 100 zł", min: 0, max: 100 },
	{ id: "100-300", label: "100–300 zł", min: 100, max: 300 },
	{ id: "300-500", label: "300–500 zł", min: 300, max: 500 },
	{ id: "500-plus", label: "500+ zł", min: 500 },
];

export const PRODUCT_CATEGORY_VALUES = PRODUCT_CATEGORIES.map((c) => c.value);
export const PRODUCT_EPOCH_VALUES = PRODUCT_EPOCHS.map((e) => e.value);
