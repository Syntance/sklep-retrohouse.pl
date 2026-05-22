"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/mock/products";
import type { ProductSource } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/posthog";
import { cn } from "@/lib/utils";

const BADGE_LABELS: Record<NonNullable<Product["badges"][number]>, string> = {
	unikat: "Unikat",
	fresh: "Świeża dostawa",
	bestseller: "Bestseller",
};

const BADGE_TONE: Record<NonNullable<Product["badges"][number]>, string> = {
	unikat: "bg-ink text-ink-foreground",
	fresh: "bg-success text-success-foreground",
	bestseller: "bg-terracotta text-terracotta-foreground",
};

type ProductCardProps = {
	product: Product;
	className?: string;
	source?: ProductSource;
	position?: number;
	/**
	 * Wymagane gdy `source === "pdp-related"` — bez tego event
	 * `related_product_clicked` nie ma `from_product_id`.
	 */
	fromProductId?: string;
};

/**
 * ProductCard — wersja „retro-przytulna" (2026-05-03):
 *  - max jeden badge (priorytet bestseller > unikat > fresh — sortowanie po stronie produktu)
 *  - bez overlay tekstu na zdjęciu (epoka idzie do bloku tekstowego)
 *  - bez noise pattern; tylko czysty radial gradient zbudowany z palety produktu
 *
 * Instrumentacja:
 *  - `source: "hp-bestsellers"` → emituje `bestseller_clicked` (Notion: BOFU bestsellers).
 *  - inne źródła → `product_card_clicked` z position.
 */
export function ProductCard({
	product,
	className,
	source = "/sklep",
	position,
	fromProductId,
}: ProductCardProps) {
	const [primary, secondary, accent] = product.imageHues;
	const url =
		source && source !== "/sklep"
			? `/sklep/${product.slug}?source=${encodeURIComponent(source)}`
			: `/sklep/${product.slug}`;
	const primaryBadge = product.badges[0];

	const handleClick = () => {
		if (source === "hp-bestsellers") {
			track({
				name: "bestseller_clicked",
				properties: { product_id: product.slug, position: position ?? 0 },
			});
			return;
		}
		if (source === "pdp-related" && fromProductId) {
			track({
				name: "related_product_clicked",
				properties: { product_id: product.slug, from_product_id: fromProductId },
			});
			return;
		}
		track({
			name: "product_card_clicked",
			properties: {
				product_id: product.slug,
				position: position ?? 0,
				source,
			},
		});
	};

	return (
		<article
			className={cn(
				"group/card relative flex h-full flex-col overflow-hidden rounded-xl border border-walnut/12 bg-card shadow-card transition-all duration-300",
				"hover:-translate-y-1 hover:border-walnut/30 hover:shadow-lg",
				className,
			)}
		>
			<Link
				href={url}
				onClick={handleClick}
				className="relative block aspect-4/5 w-full overflow-hidden focus-visible:outline-none"
				aria-label={`Zobacz: ${product.name}`}
			>
				<div
					className="absolute inset-0 transition-transform duration-700 group-hover/card:scale-[1.04]"
					style={{
						backgroundImage: `radial-gradient(120% 80% at 30% 20%, ${primary}, transparent 60%), radial-gradient(80% 80% at 80% 90%, ${secondary}, transparent 70%), linear-gradient(135deg, ${accent}, ${primary})`,
					}}
				/>
				{primaryBadge ? (
					<span
						className={cn(
							"absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] shadow-sm",
							BADGE_TONE[primaryBadge],
						)}
					>
						{BADGE_LABELS[primaryBadge]}
					</span>
				) : null}
			</Link>
			<div className="flex flex-1 flex-col gap-1.5 px-5 py-4">
				<p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-walnut/80">
					{product.categoryLabel} · {product.epochLabel}
				</p>
				<h3 className="font-display text-lg leading-snug text-foreground">
					<Link
						href={url}
						onClick={handleClick}
						className="rounded-sm transition-colors hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
					>
						<span className="line-clamp-2">{product.name}</span>
					</Link>
				</h3>
				<div className="mt-auto pt-2">
					<span className="font-display text-xl font-semibold tabular text-terracotta">
						{formatPrice(product.price)}
					</span>
				</div>
			</div>
		</article>
	);
}
