"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Wysyła jedno "wejście" na zmianę trasy. Świadomie minimalny:
 * `sendBeacon` (nie blokuje nawigacji), odpalany po bezczynności, bez cookies
 * i bez żadnego identyfikatora — serwer zapisuje wyłącznie licznik ścieżki.
 */
export function RawHitsBeacon() {
	const pathname = usePathname();
	const lastSent = useRef<string | null>(null);

	useEffect(() => {
		if (!pathname || lastSent.current === pathname) return;
		lastSent.current = pathname;

		const send = () => {
			const payload = JSON.stringify({ path: pathname });
			try {
				if (navigator.sendBeacon) {
					navigator.sendBeacon("/api/track-hit", new Blob([payload], { type: "application/json" }));
					return;
				}
			} catch {
				/* fallback niżej */
			}
			void fetch("/api/track-hit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: payload,
				keepalive: true,
			}).catch(() => undefined);
		};

		const idle = window.requestIdleCallback?.(send, { timeout: 3000 });
		const timer = idle === undefined ? setTimeout(send, 1200) : undefined;

		return () => {
			if (idle !== undefined) window.cancelIdleCallback?.(idle);
			if (timer) clearTimeout(timer);
		};
	}, [pathname]);

	return null;
}
