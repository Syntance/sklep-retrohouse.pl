"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Przewinięcie tylko przy **pierwszym** ustawieniu filtra kategorii
 * (wejście z `/sklep` bez kategorii lub pierwsze załadowanie z `?kategoria=`).
 *
 * Cel: `#sklep-filtry-start` — początek wiersza z kolumną filtrów (tam zaczyna się sticky /
 * „blokowanie” sidebara), z `scroll-mt-24` zsynchronizowanym z `aside sticky top-24`.
 *
 * Przy zmianie kategorii A → B **nie** przewijamy — lista się zmienia w miejscu.
 */
export function ShopCategoryAutoScroll() {
	const params = useSearchParams();
	const kategoria = params.get("kategoria");
	const prevKategoriaRef = useRef<string | null>(null);

	useEffect(() => {
		if (!kategoria) {
			prevKategoriaRef.current = null;
			return;
		}

		const previous = prevKategoriaRef.current;
		if (previous === kategoria) return;

		const isFirstCategoryPick = previous === null;
		prevKategoriaRef.current = kategoria;

		if (!isFirstCategoryPick) return;

		const el = document.getElementById("sklep-filtry-start");
		if (!el) return;

		const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		requestAnimationFrame(() => {
			el.scrollIntoView({
				behavior: prefersReduced ? "auto" : "smooth",
				block: "start",
			});
		});
	}, [kategoria]);

	return null;
}
