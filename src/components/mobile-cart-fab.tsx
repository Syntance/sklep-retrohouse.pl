"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartIcon } from "@/components/icons";
import { selectCartCount, useCartStore } from "@/lib/cart/store";
import { useCartMounted } from "@/lib/cart/use-cart-products";
import { track } from "@/lib/analytics/posthog";

/**
 * Pływający przycisk „Otwórz koszyk" na mobile dla /sklep
 * (Notion: „Sticky CTA mobile: 🛒 Koszyk").
 *
 * Pokazuje się dopiero po przewinięciu poniżej hero (≥ 480 px), żeby nie
 * konkurować z headerem i nie ścigać CTA hero. Klik → /koszyk + tracking
 * źródła „shop_listing_mobile_fab".
 *
 * Na pełnym koszyku Medusa: liczba w koszyku przyjdzie z `useCartStore`.
 * Na MVP pokazujemy ikonę + label, bez badge.
 */
export function MobileCartFab() {
	const [visible, setVisible] = useState(false);
	const mounted = useCartMounted();
	const count = useCartStore(selectCartCount);

	useEffect(() => {
		const handleScroll = () => setVisible(window.scrollY > 480);
		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	if (!visible) return null;

	return (
		<Link
			href="/koszyk"
			onClick={() =>
				track({
					name: "view_cart",
					properties: { items_count: count, cart_value: 0 },
				})
			}
			aria-label={mounted && count > 0 ? `Otwórz koszyk (${count})` : "Otwórz koszyk"}
			className="fixed bottom-5 right-5 z-30 inline-flex h-12 items-center gap-2 rounded-full bg-terracotta px-5 text-sm font-semibold uppercase tracking-[0.08em] text-terracotta-foreground shadow-lg lg:hidden"
			style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
		>
			<CartIcon className="size-4" />
			Koszyk
			{mounted && count > 0 ? (
				<span className="grid min-w-5 place-items-center rounded-full bg-ink-foreground/20 px-1 text-[0.65rem] font-semibold tabular">
					{count}
				</span>
			) : null}
		</Link>
	);
}
