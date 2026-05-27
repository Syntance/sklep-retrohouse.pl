"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { track } from "@/lib/analytics/posthog";
import type { ProductSource } from "@/lib/analytics/events";
import type { Product } from "@/lib/products/types";

type ProductCtaBlockProps = {
	product: Product;
	source: ProductSource | "direct";
};

/**
 * Klienckie CTA bloku PDP — emituje:
 *  - product_viewed (na mount, raz; deps: slug)
 *  - add_to_cart (przez AddToCartButton — bez nawigacji)
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

	const handleAsk = () => {
		track({ name: "product_ask_clicked", properties: { channel: "form" } });
	};

	return (
		<div className="flex flex-col gap-3">
			<AddToCartButton product={product} source="pdp" />
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
		</div>
	);
}
