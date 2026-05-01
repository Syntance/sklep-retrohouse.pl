# ADR-0002: Security headers w `next.config.ts` (CSP nonce-based — faza 2)

- **Status**: accepted (część bazowa) / proposed (CSP nonce)
- **Data**: 2026-05-01
- **Autor**: Kamil Podobiński

## Kontekst

`50-perf-a11y.mdc` i `55-security.mdc` wymagają zestawu HTTP headers chroniących przed XSS, MITM, clickjacking, fingerprintingiem. Konfiguracja musi być portable (nie tylko `vercel.json`), żeby działała w preview/staging/prod identycznie i przy ewentualnej migracji hostingu.

## Decyzja

Wszystkie security headers w `next.config.ts → headers()`:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(self), fullscreen=(self)`
- `Cross-Origin-Opener-Policy: same-origin`
- `X-DNS-Prefetch-Control: on`

`vercel.json` — tylko `regions: ["fra1"]` + `framework: nextjs` + git deployment switch. Bez duplikacji headers.

**CSP nonce-based** — odłożone do fazy 2, gdy ustalimy które domeny third-party faktycznie ładujemy (Cloudinary, Sanity CDN, PostHog EU, Sentry ingest, Vercel Insights). Wprowadzone najpierw jako `Content-Security-Policy-Report-Only` przez tydzień, potem enforcement.

## Konsekwencje

### Pozytywne

- Portable (działa też na innym hostingu).
- Single source of truth — nie szukasz w 2 plikach.
- Cache headers per typ zasobu (fonts immutable 1y).

### Negatywne / koszty

- Brak CSP w fazie 1 — XSS protection polega tylko na React JSX escapingu. Akceptowalne dopóki nie ma `dangerouslySetInnerHTML` ani 3rd-party rich text editora.

### Neutralne

- `X-Frame-Options: SAMEORIGIN` zamiast `DENY` — dopuszcza embedding do `/studio` (Sanity Studio).

## Rozważone alternatywy

1. **Wszystko w `vercel.json`** — odrzucone: lock-in na Vercel, headers nie działają na innym hostingu.
2. **CSP od dnia 1** — odrzucone: za wcześnie, połowa third-party domen jeszcze nieznana, ryzyko false-positive blokady własnych zasobów.

## Faza 2 (TODO)

- [ ] Middleware generujący per-request nonce.
- [ ] CSP `Content-Security-Policy-Report-Only` z `report-to` Sentry.
- [ ] Po tygodniu zera regresji → `Content-Security-Policy` enforcement.
- [ ] Trusted Types: `require-trusted-types-for 'script'`.

## Linki

- `.cursor/rules/55-security.mdc`, `50-perf-a11y.mdc`
- [MDN — Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
