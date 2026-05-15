"use client";

import { type RefObject, useEffect, useRef } from "react";
import type { ScrollSection } from "./events";
import { track } from "./posthog";

/**
 * useScrollDepth(section) — emit `scroll_depth` na progach 25/50/75/100.
 *
 * Mierzymy "ile sekcji zobaczył" przez IntersectionObserver: gdy sekcja
 * staje się widoczna w 25/50/75/100%, emitujemy event raz per próg.
 * Bez prefers-reduced-motion handlowania, bo nie animujemy — tylko logujemy.
 */
export function useScrollDepth<T extends HTMLElement>(
	section: ScrollSection,
): RefObject<T | null> {
	const ref = useRef<T>(null);
	const firedRef = useRef<Set<25 | 50 | 75 | 100>>(new Set());

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		if (typeof IntersectionObserver === "undefined") return;

		const thresholds: Array<25 | 50 | 75 | 100> = [25, 50, 75, 100];

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					const ratio = entry.intersectionRatio;
					for (const t of thresholds) {
						if (ratio >= t / 100 && !firedRef.current.has(t)) {
							firedRef.current.add(t);
							track({
								name: section === "story" ? "story_section_scrolled" : "scroll_depth",
								properties:
									section === "story"
										? { percent: t }
										: { percent: t, section },
							} as Parameters<typeof track>[0]);
						}
					}
				}
			},
			{ threshold: [0.25, 0.5, 0.75, 1] },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [section]);

	return ref;
}
