"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Globalne powiadomienia (sonner) — wymagane przy toast() z dowolnej strony.
 *
 * Perf: sonner ładowany dynamicznie i montowany dopiero na idle — toaster
 * jest niewidoczny do pierwszego toastu, a żaden toast nie odpala się przy
 * ładowaniu strony (wszystkie reagują na akcje użytkownika), więc opóźniony
 * mount niczego nie zmienia wizualnie ani funkcjonalnie.
 */
const Toaster = dynamic(() => import("@/components/ui/sonner").then((m) => m.Toaster), {
	ssr: false,
});

export function AppToaster() {
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
	return <Toaster position="top-center" richColors closeButton duration={5000} />;
}
