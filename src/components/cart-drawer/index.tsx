"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CartIcon } from "@/components/icons";
import { selectCartCount, useCartStore } from "@/lib/cart/store";
import { useCartMounted } from "@/lib/cart/use-cart-products";
import { cn } from "@/lib/utils";

const CartSheet = dynamic(() => import("./cart-sheet"), { ssr: false });

type CartDrawerProps = {
	triggerClassName?: string;
};

/**
 * Wysuwany koszyk z prawej — otwierany ikoną w headerze.
 *
 * Perf: zawartość sheeta (@base-ui + lista) w osobnym chunku (cart-sheet.tsx)
 * ładowanym przy pierwszym otwarciu; prefetch na idle, żeby realny klik był
 * natychmiastowy. Trigger (ikona + badge) renderuje się identycznie jak
 * wcześniej — zero zmiany wyglądu.
 */
export function CartDrawer({ triggerClassName }: CartDrawerProps) {
	const [open, setOpen] = useState(false);
	const [sheetRequested, setSheetRequested] = useState(false);
	const mounted = useCartMounted();
	const count = useCartStore(selectCartCount);

	// Prefetch chunka na idle — użytkownik klikający po >3,5 s ma go już w cache.
	useEffect(() => {
		const prefetch = () => void import("./cart-sheet");
		if (typeof window.requestIdleCallback === "function") {
			const id = window.requestIdleCallback(prefetch, { timeout: 3500 });
			return () => window.cancelIdleCallback(id);
		}
		const timer = window.setTimeout(prefetch, 3000);
		return () => window.clearTimeout(timer);
	}, []);

	return (
		<>
			<button
				type="button"
				onClick={() => {
					setSheetRequested(true);
					setOpen(true);
				}}
				aria-label={
					mounted && count > 0
						? `Koszyk (${count} ${count === 1 ? "pozycja" : "pozycji"})`
						: "Otwórz koszyk"
				}
				aria-haspopup="dialog"
				aria-expanded={open}
				className={cn(
					"relative grid size-10 cursor-pointer place-items-center rounded-full text-foreground/80 transition-colors hover:bg-cream hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
					triggerClassName,
				)}
			>
				<CartIcon className="size-5" />
				{mounted && count > 0 ? (
					<span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-terracotta px-1 text-[0.65rem] font-semibold tabular text-terracotta-foreground">
						{count}
					</span>
				) : null}
			</button>

			{sheetRequested ? <CartSheet open={open} onOpenChange={setOpen} /> : null}
		</>
	);
}
