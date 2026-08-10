/**
 * Kliencki dostęp do NEXT_PUBLIC_* — BEZ zoda.
 *
 * `@/env` (t3-oss + zod) importowany z komponentu klienckiego wciąga całego
 * zoda (~25 KiB gz + czas parsowania) do initial JS każdej strony, bo
 * AnalyticsProvider siedzi w root layoucie. Walidacja env odbywa się i tak
 * na serwerze przy imporcie `@/env` (build/boot padnie na błędnym env),
 * więc kliencka walidacja była czystym narzutem.
 *
 * Zasady zgodne z `@/env` (emptyStringAsUndefined + defaulty):
 * - pusty string traktujemy jak undefined,
 * - NEXT_PUBLIC_POSTHOG_HOST ma default https://eu.posthog.com,
 * - NEXT_PUBLIC_META_PIXEL_ID musi być cyfrowe (regex jak w env.ts).
 *
 * Uwaga: odczyty muszą być literalne (`process.env.NEXT_PUBLIC_X`) —
 * Next inline'uje je w bundlu podczas builda.
 */

function emptyAsUndefined(value: string | undefined): string | undefined {
	return value?.trim() ? value : undefined;
}

const metaPixelIdRaw = emptyAsUndefined(process.env.NEXT_PUBLIC_META_PIXEL_ID);

export const clientEnv = {
	NEXT_PUBLIC_POSTHOG_KEY: emptyAsUndefined(process.env.NEXT_PUBLIC_POSTHOG_KEY),
	NEXT_PUBLIC_POSTHOG_HOST:
		emptyAsUndefined(process.env.NEXT_PUBLIC_POSTHOG_HOST) ?? "https://eu.posthog.com",
	/** Meta Pixel — jak w env.ts: tylko wartość cyfrowa, inaczej undefined. */
	NEXT_PUBLIC_META_PIXEL_ID:
		metaPixelIdRaw && /^\d+$/.test(metaPixelIdRaw) ? metaPixelIdRaw : undefined,
} as const;
