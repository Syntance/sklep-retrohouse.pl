/**
 * Typy i stałe kodów promocyjnych — wspólne dla panelu (server) i checkoutu.
 * Bez "server-only", bo importują je też komponenty klienckie formularza.
 */

export type PromoDiscountType = "percentage" | "fixed" | "none";

export type AdminPromoCode = {
	id: string;
	code: string;
	status: "active" | "draft" | "inactive";
	discountType: PromoDiscountType;
	/** Procent (1–100) lub kwota w PLN (major units) dla fixed. */
	discountValue: number;
	productIds: string[];
	freeShippingEnabled: boolean;
	/** Minimalna wartość koszyka dla darmowej dostawy (PLN). null = bez progu. */
	freeShippingMinAmount: number | null;
	/** ID powiązanej promocji darmowej dostawy (gdy rabat + dostawa). */
	freeShippingPromotionId: string | null;
};

export type PromoCodeInput = {
	code: string;
	status: "active" | "draft";
	discountType: PromoDiscountType;
	/** Dla UI: procent lub PLN (major) — konwersja w store. */
	discountValueMajor: number;
	productIds: string[];
	freeShippingEnabled: boolean;
	/** PLN (major). */
	freeShippingMinAmountMajor: number | null;
};

export type ProductOption = {
	id: string;
	title: string;
};

/** Wewnętrzny prefix kodu promocji darmowej dostawy powiązanej z głównym kodem. */
export const RH_FS_PREFIX = "__rh_fs_";

/** Atrybut Medusa dla targetowania produktów w promocji. */
export const RH_PRODUCT_RULE_ATTR = "items.product.id";

/** Atrybut Medusa dla minimalnej wartości koszyka. */
export const RH_SUBTOTAL_RULE_ATTR = "subtotal";

export function freeShippingPromotionCode(mainPromotionId: string): string {
	return `${RH_FS_PREFIX}${mainPromotionId}`;
}

export function isShadowFreeShippingCode(code: string): boolean {
	return code.startsWith(RH_FS_PREFIX);
}
