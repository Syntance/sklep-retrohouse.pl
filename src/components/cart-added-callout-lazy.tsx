"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * CartAddedCallout ładowany na idle — snackbar pojawia się wyłącznie po
 * akcji „dodaj do koszyka" (nigdy przy ładowaniu strony), więc opóźniony
 * mount niczego nie zmienia wizualnie. Wyciąga jego chunk (współdzielony
 * m.in. z sonner) z initial JS.
 */
const CartAddedCallout = dynamic(
	() => import("@/components/cart-added-callout").then((m) => m.CartAddedCallout),
	{ ssr: false },
);

export function CartAddedCalloutLazy() {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const mount = () => setReady(true);
		if (typeof window.requestIdleCallback === "function") {
			const id = window.requestIdleCallback(mount, { timeout: 3000 });
			return () => window.cancelIdleCallback(id);
		}
		const timer = window.setTimeout(mount, 2000);
		return () => window.clearTimeout(timer);
	}, []);

	if (!ready) return null;
	return <CartAddedCallout />;
}
