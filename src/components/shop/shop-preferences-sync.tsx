"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { CONSENT_CHANGED_EVENT, readConsent, type ConsentState } from "@/lib/analytics/consent";
import {
	hasActiveShopQuery,
	readShopPreferences,
	shopPreferencesToQuery,
	writeShopPreferences,
} from "@/lib/analytics/preferences";
import type { ShopSearchParams } from "@/app/sklep/shop-params";

/**
 * Przy zgodzie na preferencje: zapamiętuje filtry /sklep i przywraca je
 * przy kolejnej wizycie bez parametrów URL.
 */
export function ShopPreferencesSync() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();
	const restoredRef = useRef(false);

	useEffect(() => {
		if (pathname !== "/sklep") return;
		if (restoredRef.current) return;
		if (hasActiveShopQuery(searchParams)) return;

		const consent = readConsent();
		if (!consent?.categories.preferences) return;

		const saved = readShopPreferences();
		if (!saved) return;

		const query = shopPreferencesToQuery(saved);
		if (!query) return;

		restoredRef.current = true;
		router.replace(`/sklep${query}`);
	}, [pathname, router, searchParams]);

	useEffect(() => {
		if (pathname !== "/sklep") return;

		const persist = () => {
			const consent = readConsent();
			if (!consent?.categories.preferences) return;
			if (!hasActiveShopQuery(searchParams)) return;

			const params: ShopSearchParams = {};
			for (const [key, value] of searchParams.entries()) {
				if (!value) continue;
				if (key === "kategoria" || key === "cenaOd" || key === "cenaDo" || key === "epoka" || key === "sort") {
					params[key] = value;
				}
			}
			writeShopPreferences(params);
		};

		persist();

		const onConsentChanged = (event: Event) => {
			const detail = (event as CustomEvent<ConsentState>).detail;
			if (!detail?.categories.preferences) return;
			persist();
		};

		window.addEventListener(CONSENT_CHANGED_EVENT, onConsentChanged);
		return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onConsentChanged);
	}, [pathname, searchParams]);

	return null;
}
