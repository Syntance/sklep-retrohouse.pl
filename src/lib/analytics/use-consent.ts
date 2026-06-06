"use client";

import { useEffect, useState } from "react";
import {
	CONSENT_CHANGED_EVENT,
	OPEN_COOKIE_BANNER_EVENT,
	type ConsentCategories,
	type ConsentState,
	emitConsentChange,
	readConsent,
	writeConsent,
} from "./consent";

type UseConsentReturn = {
	consent: ConsentCategories | null;
	isLoaded: boolean;
	isOpen: boolean;
	open: () => void;
	close: () => void;
	update: (next: Omit<ConsentCategories, "necessary">) => void;
};

/**
 * useConsent — pełny stan zgody + sterowanie bannerem.
 *
 * Dostępne CTA:
 * - „Akceptuj wszystko" → update({ analytics: true, marketing: true, preferences: true })
 * - „Odrzuć wszystko"   → update({ analytics: false, marketing: false, preferences: false })
 * - „Dostosuj"          → open() (otwiera customize-dialog)
 *
 * `isLoaded` zapobiega błyskaniu bannerem na SSR/hydration.
 */
export function useConsent(): UseConsentReturn {
	const [consent, setConsent] = useState<ConsentCategories | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const stored = readConsent();
		setConsent(stored ? stored.categories : null);
		setIsLoaded(true);

		const onConsentChanged = (event: Event) => {
			const detail = (event as CustomEvent<ConsentState>).detail;
			if (!detail) return;
			setConsent(detail.categories);
		};
		const onOpenSettings = () => setIsOpen(true);
		window.addEventListener(CONSENT_CHANGED_EVENT, onConsentChanged);
		window.addEventListener(OPEN_COOKIE_BANNER_EVENT, onOpenSettings);
		return () => {
			window.removeEventListener(CONSENT_CHANGED_EVENT, onConsentChanged);
			window.removeEventListener(OPEN_COOKIE_BANNER_EVENT, onOpenSettings);
		};
	}, []);

	const update = (next: Omit<ConsentCategories, "necessary">) => {
		const state = writeConsent(next);
		setConsent(state.categories);
		emitConsentChange(state);
	};

	return {
		consent,
		isLoaded,
		isOpen,
		open: () => setIsOpen(true),
		close: () => setIsOpen(false),
		update,
	};
}
