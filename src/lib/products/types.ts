export type ProductCategory = "porcelana" | "szklo" | "dekoracje" | "meble" | "obrazy" | "inne";

type ProductEpoch = string;

export type ProductBadge = "unikat" | "fresh" | "bestseller";

/** Pojedyncza wada / ubytek przedmiotu — uczciwy opis stanu antyku. */
export type ProductDefect = { label: string; note?: string };

export type Product = {
	/** Medusa product id — koszyk / checkout. */
	medusaId: string;
	/** Jeden wariant techniczny (Medusa wymaga; brak wyboru w UI sklepu). */
	medusaVariantId?: string;
	slug: string;
	name: string;
	/** Cena w złotówkach (np. 190 = 190 PLN). */
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
	/** Wady / ubytki dodane osobno w panelu magazynu. */
	defects: ProductDefect[];
	/** true = wyłącznie odbiór osobisty (brak wysyłki) → callout w sklepie. */
	pickupOnly: boolean;
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
