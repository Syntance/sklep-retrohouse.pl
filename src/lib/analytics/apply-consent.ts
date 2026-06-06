"use client";

import type { ConsentState } from "./consent";
import { setMarketingConsent } from "./marketing";
import { setPreferencesConsent } from "./preferences";
import {
	isAnalyticsConsented,
	resetAnalytics,
	setAnalyticsConsent,
	stopScopedSessionRecording,
	track,
} from "./posthog";

function applyConsentRuntime(state: ConsentState): void {
	const { categories } = state;

	setAnalyticsConsent(categories.analytics);
	if (!categories.analytics) {
		stopScopedSessionRecording();
		resetAnalytics();
	}

	setMarketingConsent(categories.marketing);
	setPreferencesConsent(categories.preferences);
}

/** Przywraca zapisany wybór po odświeżeniu — bez eventu audytowego. */
export function hydrateConsent(state: ConsentState): void {
	applyConsentRuntime(state);
}

/**
 * Reaguje na świadomą zmianę zgody (banner / dialog / stopka).
 * `consent_updated` leci tylko gdy analityka była lub będzie włączona.
 */
export function applyConsentChange(state: ConsentState): void {
	const { categories } = state;
	const wasAnalytics = isAnalyticsConsented();

	if (!wasAnalytics && categories.analytics) {
		setAnalyticsConsent(true);
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

	applyConsentRuntime(state);
}
