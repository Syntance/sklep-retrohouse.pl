"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { PinIcon } from "@/components/icons";
import type { ProductSource } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/posthog";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/products/types";
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
	/** CTA „Zobacz produkt" + ikona dodaj do koszyka — tylko grid /sklep. */
	showShopActions?: boolean;
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
	showShopActions = false,
}: ProductCardProps) {
	const [primary, secondary, accent] = product.imageHues;
	const [imageFailed, setImageFailed] = useState(false);
	const showImage = Boolean(product.imageUrl) && !imageFailed;
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
				className="relative block aspect-[4/3] w-full overflow-hidden focus-visible:outline-none"
				aria-label={`Zobacz: ${product.name}`}
			>
				<div
					className="absolute inset-0 transition-transform duration-700 group-hover/card:scale-[1.04]"
					style={
						showImage
							? undefined
							: {
									backgroundImage: `radial-gradient(120% 80% at 30% 20%, ${primary}, transparent 60%), radial-gradient(80% 80% at 80% 90%, ${secondary}, transparent 70%), linear-gradient(135deg, ${accent}, ${primary})`,
								}
					}
				>
					{showImage ? (
						<Image
							src={product.imageUrl ?? ""}
							alt=""
							fill
							className="object-cover"
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
							onError={() => setImageFailed(true)}
						/>
					) : null}
				</div>
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
				{product.pickupOnly ? (
					<span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-terracotta shadow-sm backdrop-blur">
						<PinIcon className="size-3" />
						Tylko odbiór
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
				{showShopActions ? (
					<div className="mt-auto flex items-center gap-2 pt-2">
						<Link
							href={url}
							onClick={handleClick}
							className="relative inline-flex h-11 min-w-0 flex-1 cursor-pointer overflow-hidden rounded-full border border-walnut/25 bg-background px-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring group-hover/card:border-terracotta"
							aria-label={`Zobacz produkt: ${product.name}, ${formatPrice(product.price, product.currencyCode)}`}
						>
							<span
								aria-hidden
								className="absolute inset-0 grid place-items-center transition-opacity duration-300 group-hover/card:opacity-0 group-focus-within/card:opacity-0 motion-reduce:transition-none"
							>
								<span className="block -translate-y-[3px] font-display text-xl font-semibold leading-none tabular text-terracotta">
									{formatPrice(product.price, product.currencyCode)}
								</span>
							</span>
							<span className="absolute inset-0 grid place-items-center text-[0.65rem] font-semibold uppercase leading-none tracking-[0.1em] text-foreground opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 group-hover/card:text-terracotta group-focus-within/card:opacity-100 group-focus-within/card:text-terracotta motion-reduce:transition-none">
								Zobacz produkt
							</span>
						</Link>
						<AddToCartButton product={product} source="/sklep" iconOnly className="size-11" />
					</div>
				) : (
					<div className="mt-auto pt-2">
						<span className="font-display text-xl font-semibold tabular text-terracotta">
							{formatPrice(product.price, product.currencyCode)}
						</span>
					</div>
				)}
			</div>
		</article>
	);
}
