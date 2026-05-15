"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRightIcon, CartIcon } from "@/components/icons";
import { track } from "@/lib/analytics/posthog";
import type { ProductSource } from "@/lib/analytics/events";
import type { Product } from "@/lib/mock/products";

type ProductCtaBlockProps = {
	product: Product;
	source: ProductSource | "direct";
};

/**
 * Klienckie CTA bloku PDP — emituje:
 *  - product_viewed (na mount, raz; deps: slug)
 *  - add_to_cart (na submit form Dodaj do koszyka)
 *  - product_ask_clicked (kontakt z subject=produkt)
 *
 * Form action="/api/cart" zostaje — dopiero gdy podepniemy backend
 * koszyka, zamienimy na Server Action z optimistic UI.
 */
export function ProductCtaBlock({ product, source }: ProductCtaBlockProps) {
	useEffect(() => {
		track({
			name: "product_viewed",
			properties: {
				product_id: product.slug,
				category: product.category,
				price: product.price,
				source,
			},
		});
	}, [product.slug, product.category, product.price, source]);

	const handleAddToCart = () => {
		track({
			name: "add_to_cart",
			properties: { product_id: product.slug, price: product.price, source: "pdp" },
		});
	};

	const handleAsk = () => {
		track({ name: "product_ask_clicked", properties: { channel: "form" } });
	};

	return (
		<form action="/api/cart" method="post" className="flex flex-col gap-3">
			<input type="hidden" name="slug" value={product.slug} />
			<button
				type="submit"
				onClick={handleAddToCart}
				className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground shadow-md transition-transform hover:translate-y-[-1px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
			>
				<CartIcon className="size-4" />
				Dodaj do koszyka
			</button>
			<Link
				href={`/kontakt?subject=produkt&slug=${product.slug}`}
				onClick={handleAsk}
				className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-terracotta hover:text-terracotta"
			>
				Zapytaj o ten przedmiot
			</Link>
			<Link
				href={`/dla-projektantow#brief?slug=${product.slug}`}
				className="inline-flex items-center gap-1.5 self-start text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70 hover:text-terracotta"
			>
				Jesteś projektantem? Rezerwacja 14 dni i FV
				<ArrowRightIcon className="size-3" />
			</Link>
		</form>
	);
}
