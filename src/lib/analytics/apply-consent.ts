"use client";

import type { ConsentState } from "./consent";
import { setMarketingConsent } from "./marketing";
import {
	isAnalyticsConsented,
	resetAnalytics,
	setAnalyticsConsent,
	stopScopedSessionRecording,
	track,
} from "./posthog";
import { setPreferencesConsent } from "./preferences";

/**
 * Marketing + preferencje — synchronicznie, bez czekania na cokolwiek.
 * Wycofanie zgody musi zadziałać natychmiast (RODO: bez zbędnej zwłoki),
 * więc nie może wisieć na dynamicznym imporcie `posthog-js`.
 */
function applyNonAnalyticsConsent(state: ConsentState): void {
	const { categories } = state;
	setMarketingConsent(categories.marketing);
	setPreferencesConsent(categories.preferences);
}

/** Analityka — asynchronicznie, bo `posthog-js` ładuje się dynamicznym import(). */
async function applyAnalyticsConsent(state: ConsentState): Promise<void> {
	const { categories } = state;

	await setAnalyticsConsent(categories.analytics);
	if (!categories.analytics) {
		stopScopedSessionRecording();
		resetAnalytics();
	}
}

/** Przywraca zapisany wybór po odświeżeniu — bez eventu audytowego. */
export function hydrateConsent(state: ConsentState): void {
	applyNonAnalyticsConsent(state);
	void applyAnalyticsConsent(state);
}

/**
 * Reaguje na świadomą zmianę zgody (banner / dialog / stopka).
 * `consent_updated` leci tylko gdy analityka była lub będzie włączona.
 *
 * Kolejność jest istotna: przy włączaniu `track` musi być PO opt-in (inaczej
 * event przepadnie), a przy wyłączaniu PRZED opt-out (żeby zdążył polecieć).
 * `posthog-js` ładuje się dynamicznie, więc ta część jest asynchroniczna —
 * marketing i preferencje stosujemy wcześniej, synchronicznie.
 */
export function applyConsentChange(state: ConsentState): void {
	const { categories } = state;
	const wasAnalytics = isAnalyticsConsented();

	applyNonAnalyticsConsent(state);

	void (async () => {
		if (!wasAnalytics && categories.analytics) {
			await setAnalyticsConsent(true);
		}

		if (wasAnalytics || categories.analytics) {
			track({
				name: "consent_updated",
				properties: {
					analytics: categories.analytics,
					marketing: categories.marketing,
					preferences: categories.preferences,
				},
			});
		}

		await applyAnalyticsConsent(state);
	})();
}
