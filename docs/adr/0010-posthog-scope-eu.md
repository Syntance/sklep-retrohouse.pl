# ADR-0010: PostHog jako analityka — EU host, autocapture off, session replay scoped

- **Status**: accepted
- **Data**: 2026-05-15
- **Autor**: RetroHouse / Senior Creative Dev

## Kontekst

Strategia (Notion: „Stack technologiczny → Konwencja eventów") definiuje 44 eventy w 8 kategoriach mierzące BOFU/MOFU/TOFU sklepu. Potrzebujemy analityki która:

- Hostuje dane w UE (RODO art. 44+, brak transferu poza EOG bez SCC).
- Nie strzela auto-eventami (kontrola PII + przewidywalny bill).
- Może nagrywać sesje tylko tam, gdzie to się opłaca (PDP, koszyk) — dla reszty stron replay = waste storage + ryzyko PII.
- Działa poprawnie bez klucza w env (preview deploys bez PII produkcyjnego).
- Wpięcie zgodne z PT art. 173 i UODO 2023 (banner opt-in z 3 równoważnymi przyciskami).

Reguły obowiązujące: 50-perf-a11y (autocapture: false, sample), 55-security (PII scrub), 56-legal (consent opt-in, retention 12m).

## Decyzja

PostHog w wariancie "manual capture":

- `api_host: https://eu.posthog.com`, `ui_host: https://eu.posthog.com`.
- `autocapture: false`, `capture_pageview: false`, `capture_pageleave: true`.
- `disable_session_recording: true` na start; włączane przez `posthog.startSessionRecording()` tylko gdy pathname zaczyna się od `/sklep/` lub `/koszyk`.
- `opt_out_capturing_by_default: true` — żaden capture przed `setAnalyticsConsent(true)`.
- `before_send` hook: usuwa `$ip`, `$initial_referring_domain`, regex-em redaguje email/telefon w properties (`[redacted-email]` / `[redacted-phone]`).
- Singleton inicjalizowany w `AnalyticsProvider` (client-only, w Suspense).
- Centralna funkcja `track<E extends AnalyticsEvent>(event: E)` — TS pilnuje sygnatur (discriminated union 44 eventów, plik `src/lib/analytics/events.ts`).
- No-op dla `track`/`identify` gdy brakuje `NEXT_PUBLIC_POSTHOG_KEY` (graceful degradation).
- Retencja w panelu PostHog ustawiona na 12 miesięcy (admin job).

## Konsekwencje

### Pozytywne

- Brak transferu PII poza EOG.
- Predyktowalny bill — capture tylko zdefiniowanych 44 eventów.
- Replay tylko tam, gdzie istnieje hipoteza biznesowa (porzucony koszyk, friction na PDP).
- Test anti-regression (`tests/analytics-events.test.ts`) pilnuje, że nazwy eventów są w sync z Notion.
- TS prevent typo / niezgodności z dashboardami (event `bestseller_clicked` musi mieć `position: number`).

### Negatywne / koszty

- Każdy nowy event wymaga ręcznego dopisania do uniona + listy `KNOWN_EVENT_NAMES`. Świadomy trade-off vs. luźnym `posthog.capture(name, props)`.
- Brak autocapture = brak heatmap kliknięć dla nieinstrumentowanych elementów. Heatmap → zaplanować osobny rollout flagą.
- Manual `page_viewed` w `useEffect` na `pathname` — dodatkowy renderpass per nawigacja (znikomy koszt).

### Neutralne

- Vendor lock-in PostHog — zaakceptowany w stosunku do Plausible (mniej eventów per session) i GA4 (USA host + Consent Mode v2 narzut).

## Rozważone alternatywy

1. **Plausible Analytics** — odpada: brak session replay, brak typed event SDK, mniej rozbudowana segmentacja funnel.
2. **Mixpanel** — odpada: USA host, transfer PII wymaga SCC + DPIA.
3. **GA4 + Consent Mode v2** — odpada: Google jako processor (RODO Schrems II ryzyko), brak event-level types.
4. **PostHog "all-defaults"** (autocapture, replay everywhere) — odpada: nieprzewidywalny bill, ryzyko PII (typowanie hasła w form), narzut INP.

## Linki

- Konwencja eventów: Notion → „Stack technologiczny → Konwencja eventów".
- Powiązane: ADR-0011 (cookie consent opt-in).
- PostHog EU residency: https://posthog.com/docs/privacy/data-storage
