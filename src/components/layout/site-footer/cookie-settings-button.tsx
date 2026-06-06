"use client";

import { OPEN_COOKIE_BANNER_EVENT } from "@/lib/analytics/consent";

/** Przycisk „Ustawienia cookies" — otwiera dialog dostosowania zgód (UODO 2023). */
export function CookieSettingsButton() {
	const handleClick = () => {
		window.dispatchEvent(new CustomEvent(OPEN_COOKIE_BANNER_EVENT));
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			className="text-sm text-ink-foreground/80 transition-colors hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
		>
			Ustawienia cookies
		</button>
	);
}
