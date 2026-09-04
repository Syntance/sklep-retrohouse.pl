"use client";

import { useState } from "react";
import { ConditionAcceptanceDialog } from "@/components/condition-acceptance-dialog";
import { CartIcon, CartPlusIcon, CheckIcon } from "@/components/icons";
import type { ProductSource } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/posthog";
import { useCartCalloutStore } from "@/lib/cart/callout-store";
import { useCartStore } from "@/lib/cart/store";
import type { Product } from "@/lib/products/types";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
	product: Product;
	source?: ProductSource | "pdp";
	className?: string;
	compact?: boolean;
	/** Kwadratowy przycisk tylko z ikoną — grid /sklep. */
	iconOnly?: boolean;
};

/**
 * Dodaje produkt do koszyka bez nawigacji — po dodaniu modal UPK
 * z akceptacją opisu stanu (art. 43a ust. 4).
 */
export function AddToCartButton({
	product,
	source = "pdp",
	className,
	compact = false,
	iconOnly = false,
}: AddToCartButtonProps) {
	const addItem = useCartStore((state) => state.addItem);
	const removeItem = useCartStore((state) => state.removeItem);
	const showCartCallout = useCartCalloutStore((state) => state.show);
	const inCart = useCartStore((state) => state.items.some((item) => item.slug === product.slug));
	const [feedback, setFeedback] = useState<"idle" | "added" | "duplicate">("idle");
	const [dialogOpen, setDialogOpen] = useState(false);

	const handleClick = () => {
		if (inCart) {
			setFeedback("duplicate");
			showCartCallout({ productName: product.name, variant: "duplicate" });
			window.setTimeout(() => setFeedback("idle"), 2500);
			return;
		}

		const added = addItem(product.slug);
		if (!added) return;

		track({
			name: "add_to_cart",
			properties: { product_id: product.slug, price: product.price, source },
		});

		setFeedback("added");
		setDialogOpen(true);
	};

	const handleConfirm = () => {
		setDialogOpen(false);
		showCartCallout({ productName: product.name, variant: "added" });
		window.setTimeout(() => setFeedback("idle"), 1500);
	};

	const handleRevert = () => {
		removeItem(product.slug);
		setDialogOpen(false);
		setFeedback("idle");
	};

	const label =
		feedback === "added"
			? "Dodano"
			: feedback === "duplicate"
				? "Już w koszyku"
				: iconOnly
					? "Dodaj do koszyka"
					: compact
						? "Dodaj"
						: "Dodaj do koszyka";

	return (
		<>
			<button
				type="button"
				onClick={handleClick}
				aria-live="polite"
				aria-label={iconOnly ? label : undefined}
				className={cn(
					"inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-terracotta text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground shadow-md transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
					feedback === "added" && "bg-success text-success-foreground",
					feedback === "duplicate" && "bg-walnut/80",
					iconOnly && "size-10 shrink-0 p-0 shadow-sm hover:-translate-y-px",
					!iconOnly && compact && "h-11 px-4 text-xs",
					!iconOnly && !compact && "h-12 w-full px-6 hover:-translate-y-px",
					className,
				)}
			>
				{feedback === "added" ? (
					<CheckIcon className="size-4" aria-hidden />
				) : iconOnly ? (
					<CartPlusIcon className="size-4" aria-hidden />
				) : (
					<CartIcon className="size-4" aria-hidden />
				)}
				{iconOnly ? <span className="sr-only">{label}</span> : <span>{label}</span>}
				{compact && !iconOnly ? <span className="sr-only">do koszyka</span> : null}
			</button>

			<ConditionAcceptanceDialog
				product={product}
				open={dialogOpen}
				onConfirm={handleConfirm}
				onRevert={handleRevert}
			/>
		</>
	);
}
