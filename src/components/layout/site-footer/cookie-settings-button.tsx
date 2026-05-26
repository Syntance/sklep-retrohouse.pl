"use client";

/**
 * Przycisk „Ustawienia cookies" w stopce.
 *
 * Ponownie otwiera banner GDPR (Klaro / własny consent manager).
 * Wywołuje `window.__klaro?.show()` lub własny event `open-cookie-banner`,
 * który nasłuchuje implementacja consent managera.
 *
 * Zgodność: UODO 2023 — przycisk Odrzuć / Ustawienia musi być równie dostępny
 * co Akceptuj. Dark pattern = brak tego przycisku w stopce.
 */
export function CookieSettingsButton() {
	const handleClick = () => {
		// Klaro: window.__klaro?.show()
		// Własny event — consent manager nasłuchuje i otwiera modal.
		if (typeof window !== "undefined") {
			window.dispatchEvent(new CustomEvent("open-cookie-banner"));
		}
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
