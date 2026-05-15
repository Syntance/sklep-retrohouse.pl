"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import {
	CONSENT_CHANGED_EVENT,
	type ConsentState,
	readConsent,
} from "./consent";
import {
	initPostHog,
	resetAnalytics,
	setAnalyticsConsent,
	startScopedSessionRecording,
	stopScopedSessionRecording,
	track,
} from "./posthog";

type AnalyticsProviderProps = { children: React.ReactNode };

/**
 * AnalyticsProvider — montuje PostHog, słucha consent, emituje page_viewed
 * przy każdej zmianie ścieżki (App Router) i włącza session replay scoped.
 *
 * useSearchParams wymusza Suspense boundary (Next 16) — dlatego całość
 * `Inner` w Suspense.
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
	return (
		<>
			{children}
			<Suspense fallback={null}>
				<AnalyticsRouter />
			</Suspense>
		</>
	);
}

function AnalyticsRouter() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		initPostHog();
		const stored = readConsent();
		if (stored?.categories.analytics) setAnalyticsConsent(true);

		const handler = (event: Event) => {
			const detail = (event as CustomEvent<ConsentState>).detail;
			if (!detail) return;
			setAnalyticsConsent(detail.categories.analytics);
			if (!detail.categories.analytics) {
				stopScopedSessionRecording();
				resetAnalytics();
			}
		};
		window.addEventListener(CONSENT_CHANGED_EVENT, handler);
		return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handler);
	}, []);

	useEffect(() => {
		const utm: Record<string, string | undefined> = {};
		for (const key of [
			"utm_source",
			"utm_medium",
			"utm_campaign",
			"utm_content",
			"utm_term",
		]) {
			const value = searchParams.get(key);
			if (value) utm[key] = value;
		}
		track({
			name: "page_viewed",
			properties: {
				path: pathname,
				referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
				utm_source: utm.utm_source,
				utm_medium: utm.utm_medium,
				utm_campaign: utm.utm_campaign,
				utm_content: utm.utm_content,
				utm_term: utm.utm_term,
			},
		});

		const sessionRecordingScopes = ["/koszyk", "/sklep/"];
		const shouldRecord = sessionRecordingScopes.some((scope) => pathname.startsWith(scope));
		if (shouldRecord) startScopedSessionRecording();
		else stopScopedSessionRecording();
	}, [pathname, searchParams]);

	return null;
}
