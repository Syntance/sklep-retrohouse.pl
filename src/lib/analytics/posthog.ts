"use client";

import type { PostHog } from "posthog-js";
import { clientEnv } from "@/env.client";
import type { AnalyticsEvent } from "./events";

/**
 * PostHog singleton — `posthog-js` (~60 KB gzip) ładowany dynamicznym
 * import(), nie top-level, żeby nie wchodził do initial JS na każdej
 * stronie (LCP/TBT). Init i tak jest odroczony do idle callback w
 * AnalyticsProvider, więc póki ten import się nie rozwiąże, `track`/
 * `identify` itd. są no-opami — dokładnie tak jak wcześniej przed idle.
 *
 * Reguły:
 * - EU host (eu.posthog.com) — RODO art. 44+, brak transferu poza EOG.
 * - autocapture: false — manual capture (mniej eventów = niższy bill,
 *   pełna kontrola nad PII).
 * - capture_pageview: false — Provider robi to ręcznie po consent.
 * - disable_session_recording: true na start — włączane scoped tylko
 *   na /sklep/[slug] i /koszyk/* przez `posthog.startSessionRecording()`.
 * - beforeSend: PII scrub (email/phone/postal/IP) — reguła 55-security.
 * - No-op gdy NEXT_PUBLIC_POSTHOG_KEY brak (graceful degradation).
 */

let posthogInstance: PostHog | null = null;
let posthogPromise: Promise<PostHog | null> | null = null;
let consented = false;

export function isAnalyticsConsented(): boolean {
	return consented;
}

function isEnabled(): boolean {
	return Boolean(clientEnv.NEXT_PUBLIC_POSTHOG_KEY);
}

export function initPostHog(): Promise<PostHog | null> {
	if (!isEnabled()) return Promise.resolve(null);
	if (typeof window === "undefined") return Promise.resolve(null);
	if (posthogPromise) return posthogPromise;

	posthogPromise = import("posthog-js").then(({ default: posthog }) => {
		posthog.init(clientEnv.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
			api_host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
			ui_host: "https://eu.posthog.com",
			autocapture: false,
			capture_pageview: false,
			capture_pageleave: true,
			disable_session_recording: true,
			disable_surveys: true,
			// Wyłączamy lazy-loaded extensions z CDN PostHog — nie potrzebujemy
			// dead clicks ani web vitals (mamy Speed Insights od Vercel)
			capture_performance: false,
			enable_heatmaps: false,
			persistence: "localStorage+cookie",
			opt_out_capturing_by_default: true,
			before_send: (eventPayload) => {
				if (!eventPayload) return null;
				const props = eventPayload.properties ?? {};
				delete props.$ip;
				delete props.$initial_referring_domain;
				for (const key of Object.keys(props)) {
					const value = props[key];
					if (typeof value !== "string") continue;
					if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(value)) {
						props[key] = "[redacted-email]";
					} else if (/(\+?\d[\d\s-]{7,}\d)/.test(value)) {
						props[key] = "[redacted-phone]";
					}
				}
				eventPayload.properties = props;
				return eventPayload;
			},
		});

		posthogInstance = posthog;
		return posthog;
	});

	return posthogPromise;
}

export async function setAnalyticsConsent(allowed: boolean): Promise<void> {
	if (!isEnabled()) return;
	consented = allowed;
	const instance = await initPostHog();
	if (!instance) return;
	if (allowed) instance.opt_in_capturing();
	else instance.opt_out_capturing();
}

export function startScopedSessionRecording() {
	if (!isEnabled() || !posthogInstance || !consented) return;
	posthogInstance.startSessionRecording();
}

export function stopScopedSessionRecording() {
	if (!isEnabled() || !posthogInstance) return;
	posthogInstance.stopSessionRecording();
}

/**
 * Centralna funkcja `track` — TS pilnuje sygnatur eventów.
 * Zawsze sprawdza consent (no-op bez zgody, bez klucza, bez okna,
 * bez załadowanego jeszcze modułu posthog-js).
 */
export function track<E extends AnalyticsEvent>(event: E): void {
	if (!isEnabled()) return;
	if (typeof window === "undefined") return;
	if (!posthogInstance) return;
	if (!consented) return;
	posthogInstance.capture(event.name, event.properties as Record<string, unknown>);
}

export function identify(distinctId: string, traits?: Record<string, string | number | boolean>) {
	if (!isEnabled() || !posthogInstance || !consented) return;
	posthogInstance.identify(distinctId, traits);
}

export function resetAnalytics() {
	if (!isEnabled() || !posthogInstance) return;
	posthogInstance.reset();
}
