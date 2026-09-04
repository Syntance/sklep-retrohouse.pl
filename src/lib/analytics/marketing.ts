"use client";

import { clientEnv } from "@/env.client";

type FbqFunction = ((...args: unknown[]) => void) & {
	callMethod?: (...args: unknown[]) => void;
	queue?: unknown[][];
	push?: FbqFunction;
	loaded?: boolean;
	version?: string;
};

declare global {
	interface Window {
		fbq?: FbqFunction;
		_fbq?: FbqFunction;
	}
}

const SCRIPT_ID = "rh-meta-pixel";
let pixelLoaded = false;

function isEnabled(): boolean {
	return Boolean(clientEnv.NEXT_PUBLIC_META_PIXEL_ID);
}

function getPixelId(): string {
	return clientEnv.NEXT_PUBLIC_META_PIXEL_ID ?? "";
}

function loadMetaPixel(): void {
	if (!isEnabled() || typeof window === "undefined" || pixelLoaded) return;

	const fbq = ((...args: unknown[]) => {
		if (fbq.callMethod) {
			fbq.callMethod(...args);
		} else {
			fbq.queue?.push(args);
		}
	}) as FbqFunction;
	if (!window.fbq) window.fbq = fbq;
	if (!window._fbq) window._fbq = window.fbq;
	window.fbq.push = window.fbq;
	window.fbq.loaded = true;
	window.fbq.version = "2.0";
	window.fbq.queue = window.fbq.queue ?? [];

	if (!document.getElementById(SCRIPT_ID)) {
		const script = document.createElement("script");
		script.id = SCRIPT_ID;
		script.async = true;
		script.src = "https://connect.facebook.net/en_US/fbevents.js";
		document.head.appendChild(script);
	}

	window.fbq("init", getPixelId());
	window.fbq("track", "PageView");
	pixelLoaded = true;
}

function clearMetaCookies(): void {
	if (typeof document === "undefined") return;
	const hostname = window.location.hostname;
	const domains = [hostname, `.${hostname}`];
	for (const name of ["_fbp", "_fbc"]) {
		for (const domain of domains) {
			// biome-ignore lint/suspicious/noDocumentCookie: wygaszanie cookies Meta po cofnięciu zgody — cookieStore API nie ma wsparcia w Safari
			document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
		}
		// biome-ignore lint/suspicious/noDocumentCookie: jw. — wariant bez atrybutu domain
		document.cookie = `${name}=; Max-Age=0; path=/`;
	}
}

function unloadMetaPixel(): void {
	if (typeof window === "undefined") return;
	document.getElementById(SCRIPT_ID)?.remove();
	clearMetaCookies();
	window.fbq = undefined;
	window._fbq = undefined;
	pixelLoaded = false;
}

export function setMarketingConsent(allowed: boolean): void {
	if (!isEnabled()) return;
	if (allowed) loadMetaPixel();
	else unloadMetaPixel();
}

export function trackMetaPurchase(payload: {
	value: number;
	currency: string;
	orderId: string;
	itemsCount: number;
}): void {
	if (!isEnabled() || !pixelLoaded || typeof window === "undefined" || !window.fbq) return;
	window.fbq("track", "Purchase", {
		value: payload.value,
		currency: payload.currency,
		content_ids: [payload.orderId],
		num_items: payload.itemsCount,
	});
}
