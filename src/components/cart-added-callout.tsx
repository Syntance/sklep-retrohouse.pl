"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { useCartCalloutStore } from "@/lib/cart/callout-store";
import { selectCartCount, useCartStore } from "@/lib/cart/store";
import { track } from "@/lib/analytics/posthog";
import { cn } from "@/lib/utils";

const AUTO_DISMISS_MS = 6_000;

/**
 * Dolny callout po dodaniu do koszyka — bez overlay / blur.
 * GTA-style snackbar z CTA „Zobacz koszyk”.
 */
export function CartAddedCallout() {
	const open = useCartCalloutStore((s) => s.open);
	const variant = useCartCalloutStore((s) => s.variant);
	const productName = useCartCalloutStore((s) => s.productName);
	const hide = useCartCalloutStore((s) => s.hide);
	const count = useCartStore(selectCartCount);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!open) return;

		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => hide(), AUTO_DISMISS_MS);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [open, hide, productName, variant]);

	if (!open) return null;

	const title = variant === "duplicate" ? "Już w koszyku" : "Dodano do koszyka";

	return (
		<div
			role="status"
			aria-live="polite"
			className={cn(
				"pointer-events-none fixed inset-x-4 z-40 sm:inset-x-auto sm:left-1/2 sm:w-[min(100%,26rem)] sm:-translate-x-1/2",
				"motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:fade-in motion-safe:duration-300",
			)}
			style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
		>
			<div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-walnut/20 bg-card px-4 py-3 shadow-[0_12px_40px_oklch(0.22_0.04_45/0.22)]">
				<span
					className={cn(
						"grid size-9 shrink-0 place-items-center rounded-full",
						variant === "duplicate" ? "bg-walnut/15 text-walnut" : "bg-success/15 text-success",
					)}
					aria-hidden
				>
					<CheckIcon className="size-4" />
				</span>

				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold text-foreground">{title}</p>
					{productName ? (
						<p className="truncate text-xs text-muted-foreground">{productName}</p>
					) : null}
				</div>

				<Link
					href="/koszyk"
					onClick={() => {
						hide();
						track({
							name: "view_cart",
							properties: { items_count: count, cart_value: 0 },
						});
					}}
					className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-terracotta px-4 text-xs font-semibold uppercase tracking-[0.08em] text-terracotta-foreground transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
				>
					Zobacz koszyk
				</Link>

				<button
					type="button"
					onClick={hide}
					className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
					aria-label="Zamknij"
				>
					<CloseIcon className="size-4" aria-hidden />
				</button>
			</div>
		</div>
	);
}
