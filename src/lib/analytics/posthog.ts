"use client";

import posthog, { type PostHog } from "posthog-js";
import { env } from "@/env";
import type { AnalyticsEvent } from "./events";

/**
 * PostHog singleton.
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

let initialized = false;
let consented = false;

export function isAnalyticsConsented(): boolean {
	return consented;
}

function isEnabled(): boolean {
	return Boolean(env.NEXT_PUBLIC_POSTHOG_KEY);
}

export function initPostHog(): PostHog | null {
	if (!isEnabled()) return null;
	if (typeof window === "undefined") return null;
	if (initialized) return posthog;

	posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
		api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
		ui_host: "https://eu.posthog.com",
		autocapture: false,
		capture_pageview: false,
		capture_pageleave: true,
		disable_session_recording: true,
		disable_surveys: true,
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

	initialized = true;
	return posthog;
}

export function setAnalyticsConsent(allowed: boolean) {
	if (!isEnabled()) return;
	if (!initialized) initPostHog();
	consented = allowed;
	if (allowed) posthog.opt_in_capturing();
	else posthog.opt_out_capturing();
}

export function startScopedSessionRecording() {
	if (!isEnabled() || !initialized || !consented) return;
	posthog.startSessionRecording();
}

export function stopScopedSessionRecording() {
	if (!isEnabled() || !initialized) return;
	posthog.stopSessionRecording();
}

/**
 * Centralna funkcja `track` — TS pilnuje sygnatur eventów.
 * Zawsze sprawdza consent (no-op bez zgody, bez klucza, bez okna).
 */
export function track<E extends AnalyticsEvent>(event: E): void {
	if (!isEnabled()) return;
	if (typeof window === "undefined") return;
	if (!initialized) return;
	if (!consented) return;
	posthog.capture(event.name, event.properties as Record<string, unknown>);
}

export function identify(distinctId: string, traits?: Record<string, string | number | boolean>) {
	if (!isEnabled() || !initialized || !consented) return;
	posthog.identify(distinctId, traits);
}

export function resetAnalytics() {
	if (!isEnabled() || !initialized) return;
	posthog.reset();
}
