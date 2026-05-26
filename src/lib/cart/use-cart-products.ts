"use client";

import { useEffect, useMemo, useState } from "react";
import { getProductBySlug, type Product } from "@/lib/mock/products";
import { useCartStore } from "@/lib/cart/store";

/**
 * Zwraca produkty z koszyka po rehydracji Zustand persist.
 * Przed hydracją [] — unikamy mismatch SSR/CSR na badge i liście.
 *
 * Selektor musi zwracać stabilną referencję (`state.items`), nie nową tablicę
 * z `.map()` — inaczej React 19 + useSyncExternalStore wchodzą w pętlę.
 */
export function useCartProducts(): Product[] {
	const items = useCartStore((state) => state.items);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return useMemo(() => {
		if (!mounted) return [];
		return items
			.map((item) => getProductBySlug(item.slug))
			.filter((product): product is Product => product !== undefined);
	}, [items, mounted]);
}

export function useCartMounted(): boolean {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	return mounted;
}
