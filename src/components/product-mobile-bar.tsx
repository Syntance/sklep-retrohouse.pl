"use client";

import Link from "next/link";
import { CartIcon } from "@/components/icons";
import { track } from "@/lib/analytics/posthog";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/mock/products";

type ProductMobileBarProps = {
	product: Product;
};

/**
 * Mobile sticky CTA na PDP (Notion: „Sticky CTA mobile: Dodaj do koszyka").
 *
 * Widoczne tylko < lg (`lg:hidden`). Respektuje safe-area-inset-bottom (iOS PWA),
 * używa `position: fixed` zamiast `sticky` żeby działało nawet w środku
 * długiej strony. Backdrop-blur podkreśla, że bar płynie nad treścią.
 *
 * Tracking: `add_to_cart` z `source: "pdp"` (zgodne z Notion event contract,
 * spójne z głównym CTA z `ProductCtaBlock` — żeby agregat nie rozdzielał).
 */
export function ProductMobileBar({ product }: ProductMobileBarProps) {
	const handleAddToCart = () => {
		track({
			name: "add_to_cart",
			properties: { product_id: product.slug, price: product.price, source: "pdp" },
		});
	};

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
				<form action="/api/cart" method="post" className="shrink-0">
					<input type="hidden" name="slug" value={product.slug} />
					<button
						type="submit"
						onClick={handleAddToCart}
						className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-terracotta px-4 text-xs font-semibold uppercase tracking-[0.08em] text-terracotta-foreground shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
					>
						<CartIcon className="size-4" />
						<span>Dodaj</span>
						<span className="sr-only">do koszyka</span>
					</button>
				</form>
			</div>
			<div className="mx-auto flex max-w-2xl items-center justify-between gap-2 border-t border-border px-4 py-1.5 text-[0.7rem] text-foreground/65">
				<span>🇦🇹 Wiedeń · Unikat 1/1</span>
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
