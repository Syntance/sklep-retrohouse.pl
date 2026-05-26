"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { track } from "@/lib/analytics/posthog";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/mock/products";

type ProductMobileBarProps = {
	product: Product;
};

/**
 * Mobile sticky CTA na PDP (Notion: „Sticky CTA mobile: Dodaj do koszyka").
 *
 * Dodanie do koszyka bez nawigacji — user zostaje na stronie produktu.
 */
export function ProductMobileBar({ product }: ProductMobileBarProps) {
	return (
		<div
			className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
			style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
		>
			<div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2.5">
				<div className="min-w-0 flex-1">
					<p className="truncate text-xs uppercase tracking-[0.14em] text-foreground/55">
						{product.categoryLabel}
					</p>
					<p className="truncate font-display text-sm">{product.name}</p>
				</div>
				<p className="font-display text-base font-semibold tabular text-foreground">
					{formatPrice(product.price)}
				</p>
				<AddToCartButton product={product} source="pdp" compact className="shrink-0" />
			</div>
			<div className="mx-auto flex max-w-2xl items-center justify-between gap-2 border-t border-border px-4 py-1.5 text-[0.7rem] text-foreground/65">
				<span>Unikat 1/1</span>
				<Link
					href={`/kontakt?subject=produkt&slug=${product.slug}`}
					onClick={() =>
						track({ name: "product_ask_clicked", properties: { channel: "form" } })
					}
					className="font-semibold uppercase tracking-[0.14em] text-foreground hover:text-terracotta"
				>
					Zapytaj
				</Link>
			</div>
		</div>
	);
}
