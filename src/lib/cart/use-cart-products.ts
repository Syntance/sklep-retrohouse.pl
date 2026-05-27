"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products/types";
import { useCartStore } from "@/lib/cart/store";

/**
 * Produkty koszyka z Medusa — fetch po rehydracji Zustand.
 */
export function useCartProducts(): Product[] {
	const items = useCartStore((state) => state.items);
	const [mounted, setMounted] = useState(false);
	const [products, setProducts] = useState<Product[]>([]);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted || items.length === 0) {
			setProducts([]);
			return;
		}

		const slugs = items.map((item) => item.slug).join(",");
		const controller = new AbortController();

		fetch(`/api/products?slugs=${encodeURIComponent(slugs)}`, {
			signal: controller.signal,
		})
			.then((response) => response.json())
			.then((data: { products?: Product[] }) => {
				setProducts(data.products ?? []);
			})
			.catch(() => {
				if (!controller.signal.aborted) setProducts([]);
			});

		return () => controller.abort();
	}, [items, mounted]);

	return useMemo(() => {
		if (!mounted) return [];
		const bySlug = new Map(products.map((product) => [product.slug, product]));
		return items
			.map((item) => bySlug.get(item.slug))
			.filter((product): product is Product => product !== undefined);
	}, [items, mounted, products]);
}

export function useCartMounted(): boolean {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	return mounted;
}
