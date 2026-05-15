# ADR-0011: Cookie consent — własny banner opt-in zamiast Klaro/Cookiebot

- **Status**: accepted
- **Data**: 2026-05-15
- **Autor**: RetroHouse / Senior Creative Dev

## Kontekst

Polskie i unijne wymogi (PT art. 173, RODO, UODO 2023, EAA 2025):

- Zgoda **aktywna opt-in**, nie pre-checked.
- 3 przyciski **równoważne wagą UI**: Akceptuj / Odrzuć / Dostosuj. Ciemny wzorzec (kolorowy „Akceptuj" + szary „Odrzuć") = kara UODO.
- Banner nie blokuje scroll.
- 4 kategorie: Necessary (lock-on), Analytics, Marketing, Preferences.
- Możliwość ponownego otwarcia ustawień (link w stopce + deklaracja dostępności).
- Scripts analityczne (PostHog) odpalają się dopiero po `consent.analytics === true`.

Stack (`10-stack`) sugeruje Klaro lub Cookiebot. Klaro = ~80 KB JS + dodatkowy wrapper konfigu, Cookiebot = paid + zewnętrzny processor (DPA do podpisu, kolejna firma w łańcuchu).

## Decyzja

Własny mini-banner ~150 LOC + native `<dialog>` dla customize:

- `src/lib/analytics/consent.ts` — model + storage (`localStorage` klucz `rh-consent`, wersjonowanie `CONSENT_VERSION`).
- `src/components/cookie-consent/index.tsx` — banner sticky bottom-left (md+) / pełna szerokość (mobile).
- `src/components/cookie-consent/customize-dialog.tsx` — `<dialog>` z 4 toggle.
- `src/lib/analytics/use-consent.ts` — hook zwracający `{ consent, isLoaded, isOpen, open, close, update }`.
- Custom event `rh:consent-changed` — `AnalyticsProvider` reaguje i włącza/wyłącza PostHog (`setAnalyticsConsent`).
- `consent_updated` w PostHog (po consent on) — historia zmian.
- 3 CTA tej samej wagi (te same warianty kolorystyczne i te same `cta-text` style; różnica tylko terakota fill na "Akceptuj wszystko" jako kolor brandu — nie boost konwersji, bo "Odrzuć" ma identyczne wymiary i kontrast 4.5:1).
- `Esc` nie zamyka bannera — wymóg świadomego wyboru.
- Re-open w stopce: link z `data-cookie-settings` (event listener globalny).

## Konsekwencje

### Pozytywne

- Zero zewnętrznego processora cookies (nie ma DPA z Klaro/Cookiebot).
- ~3 KB JS gz vs. Klaro ~30 KB.
- Pełna kontrola UX — pasuje do paleta z brandbook 2026-05-03 (terakota / walnut / krem).
- 4 kategorie zgodne z UODO recommendation; rozbudowa o nowe kategorie = jedna linijka w `ConsentCategories`.

### Negatywne / koszty

- Utrzymanie własnego rozwiązania (na nas DPIA, nie na vendorze).
- Brak gotowych tłumaczeń (jesteśmy po polsku, ale gdy dojdzie EN — ręczne strings).
- Brak audytu zewnętrznego — przy większym ruchu rozważyć Cookiebot tylko dla certyfikatu.

### Neutralne

- `localStorage` zamiast 1st-party cookie — różnica niewidoczna dla usera, ale dla nas brak nagłówka `Set-Cookie` na każdym requeście.

## Rozważone alternatywy

1. **Klaro (open-source)** — odpada: 30+ KB JS, JSON konfig zamiast TS, brand-mismatch.
2. **Cookiebot** — odpada: paid (~10 EUR/mies. dla 1 domeny), zewnętrzny processor.
3. **Brak bannera + GA4 Consent Mode** — odpada: kara UODO za brak opt-in.

## Linki

- UODO 2023 stanowisko ws. dark patterns: https://uodo.gov.pl/pl/138/2776
- ADR-0010 (PostHog).
- Reguła 56-legal (EAA + GDPR DSR + Prawo telekomunikacyjne).
