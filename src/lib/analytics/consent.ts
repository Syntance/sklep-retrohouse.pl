/**
 * Cookie consent — model i storage.
 *
 * UODO + EAA + Prawo telekomunikacyjne art. 173:
 * - Opt-in (aktywna zgoda), nie pre-checked.
 * - 4 kategorie: Necessary (zawsze on), Analytics, Marketing, Preferences.
 * - Możliwość odrzucenia w każdym momencie (ten sam waga UI co akceptacja).
 *
 * Storage: localStorage (klucz `rh-consent`). Wersjonowane — gdy zmienimy
 * skład kategorii, podbijamy `CONSENT_VERSION` i banner pojawia się ponownie.
 */

export const CONSENT_STORAGE_KEY = "rh-consent";
export const CONSENT_VERSION = 1;

export type ConsentCategories = {
	/** Zawsze true. Pliki niezbędne do działania (sesja, koszyk, CSRF). */
	necessary: true;
	analytics: boolean;
	marketing: boolean;
	preferences: boolean;
};

export type ConsentState = {
	version: number;
	updatedAt: string;
	categories: ConsentCategories;
};

export const DEFAULT_CONSENT: ConsentCategories = {
	necessary: true,
	analytics: false,
	marketing: false,
	preferences: false,
};

export function hasConsentCategory(
	category: keyof Omit<ConsentCategories, "necessary">,
): boolean {
	return Boolean(readConsent()?.categories[category]);
}

export function readConsent(): ConsentState | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<ConsentState>;
		if (parsed.version !== CONSENT_VERSION) return null;
		if (!parsed.categories) return null;
		return {
			version: CONSENT_VERSION,
			updatedAt: parsed.updatedAt ?? new Date().toISOString(),
			categories: {
				necessary: true,
				analytics: Boolean(parsed.categories.analytics),
				marketing: Boolean(parsed.categories.marketing),
				preferences: Boolean(parsed.categories.preferences),
			},
		};
	} catch {
		return null;
	}
}

export function writeConsent(categories: Omit<ConsentCategories, "necessary">): ConsentState {
	const state: ConsentState = {
		version: CONSENT_VERSION,
		updatedAt: new Date().toISOString(),
		categories: { necessary: true, ...categories },
	};
	if (typeof window !== "undefined") {
		try {
			window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
		} catch {
			/* private mode / disabled storage — degradacja na sesyjne in-memory poniżej */
		}
	}
	return state;
}

/**
 * Event nazwy custom — emitujemy gdy zgoda się zmienia, żeby
 * AnalyticsProvider mógł zareagować bez globalnego state managera.
 */
export const CONSENT_CHANGED_EVENT = "rh:consent-changed";

/** Stopka / polityka cookies — ponowne otwarcie dialogu „Dostosuj”. */
export const OPEN_COOKIE_BANNER_EVENT = "open-cookie-banner";

export function emitConsentChange(state: ConsentState) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_CHANGED_EVENT, { detail: state }));
}
