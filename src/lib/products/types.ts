export type ProductCategory =
	| "porcelana"
	| "szklo"
	| "dekoracje"
	| "meble"
	| "obrazy"
	| "inne";

export type ProductEpoch = "secesja" | "art-deco" | "lata-50" | "lata-60-70" | "inne";

export type ProductBadge = "unikat" | "fresh" | "bestseller";

export type Product = {
	/** Medusa product id — koszyk / checkout. */
	medusaId: string;
	slug: string;
	name: string;
	/** Cena w jednostkach głównych waluty (np. 10 = 10 EUR). */
	price: number;
	currencyCode: string;
	category: ProductCategory;
	categoryLabel: string;
	epoch: ProductEpoch;
	epochLabel: string;
	manufacturer: string;
	signature?: string;
	dimensions: string;
	condition: string;
	badges: ProductBadge[];
	addedAt: string;
	story: string;
	shortDescription: string;
	imageHues: [string, string, string];
	/** URL miniatury z Medusa — karta produktu / galeria. */
	imageUrl?: string;
	images: string[];
	popularity: number;
	giftBestseller?: boolean;
};
