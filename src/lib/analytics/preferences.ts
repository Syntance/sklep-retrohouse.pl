"use client";

import type { ShopSearchParams } from "@/app/sklep/shop-params";

export const SHOP_PREFERENCES_KEY = "rh-shop-preferences";

const PREFERENCE_KEYS = ["kategoria", "cenaOd", "cenaDo", "epoka", "sort"] as const;

function isPreferenceKey(key: string): key is keyof ShopSearchParams {
	return (PREFERENCE_KEYS as readonly string[]).includes(key);
}

export function readShopPreferences(): ShopSearchParams | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(SHOP_PREFERENCES_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Record<string, unknown>;
		const result: ShopSearchParams = {};
		for (const key of PREFERENCE_KEYS) {
			const value = parsed[key];
			if (typeof value === "string" && value.trim()) {
				result[key] = value;
			}
		}
		return Object.keys(result).length > 0 ? result : null;
	} catch {
		return null;
	}
}

export function writeShopPreferences(params: ShopSearchParams): void {
	if (typeof window === "undefined") return;
	const payload: ShopSearchParams = {};
	for (const [key, value] of Object.entries(params)) {
		if (!isPreferenceKey(key) || !value?.trim()) continue;
		payload[key] = value;
	}
	try {
		if (Object.keys(payload).length === 0) {
			window.localStorage.removeItem(SHOP_PREFERENCES_KEY);
			return;
		}
		window.localStorage.setItem(SHOP_PREFERENCES_KEY, JSON.stringify(payload));
	} catch {
		/* private mode */
	}
}

export function clearShopPreferences(): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.removeItem(SHOP_PREFERENCES_KEY);
	} catch {
		/* private mode */
	}
}

export function setPreferencesConsent(allowed: boolean): void {
	if (!allowed) clearShopPreferences();
}

export function shopPreferencesToQuery(params: ShopSearchParams): string {
	const search = new URLSearchParams();
	for (const key of PREFERENCE_KEYS) {
		const value = params[key];
		if (value) search.set(key, value);
	}
	const stringified = search.toString();
	return stringified ? `?${stringified}` : "";
}

export function hasActiveShopQuery(searchParams: URLSearchParams): boolean {
	return PREFERENCE_KEYS.some((key) => searchParams.has(key));
}
