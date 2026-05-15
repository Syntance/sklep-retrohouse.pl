# ADR-0007: Server Actions + Zod dla formularzy, Resend stub do etapu 2

- **Status**: accepted
- **Data**: 2026-05-15
- **Autor**: RetroHouse / Senior Creative Dev

## Kontekst

Strategia Notion ma 4 formularze:
1. B2B brief (`/dla-projektantow#brief`).
2. Kontakt (`/kontakt` — PR 6).
3. Live reminder (`/api/live-reminder`).
4. Newsletter (homepage + footer + popup).

Wszystkie obecnie operują na mockowym mock-stacku — brak Resend / Slack hook. Pytanie: czy wpinać dziś external integration (Resend), czy dawać mocka i etapować?

Wymóg 60-quality § stabilność:

> External call MUSI mieć timeout (`AbortSignal.timeout(5_000)`).

Dodanie Resend bez kontraktu DPA i klucza w env = anti-pattern (deploy z fetch'em do nieistniejącego endpointu, debugging w prod).

## Decyzja

Dla wszystkich formularzy:

- **Frontend**: React 19 `useActionState` + `<form action={action}>` (Server Actions).
- **Walidacja**: Zod schema źródłem prawdy. Plik `src/lib/validation/<form>.ts` reużywany client + server.
- **Server Action**: `src/app/<route>/actions.ts` (`"use server"`):
  - Krok 1: `rate-limit` po IP (Upstash gdy env, in-memory fallback `src/lib/rate-limit.ts`).
  - Krok 2: parse Zodem → field errors mapped 1:1 na inputy.
  - Krok 3: stub TODO Resend — komentarz + return success.
- **CSRF**: ufamy native ochronie Next 16 (encrypted action ID + origin check). Nigdy `--unsafe-action-id`.
- **PostHog**: track po stronie klienta (po success state) — server-side track wymagałby PostHog Node SDK + osobnego flow, a właśnie chcemy redukcji powierzchni.

Etap 2 (gdy pojawią się sekrety):
- `RESEND_API_KEY` → wpinamy `resend.emails.send()` z `AbortSignal.timeout(5_000)`.
- Slack webhook (`SLACK_B2B_WEBHOOK_URL`) → notyfikacja zespołu z payloadem briefu.
- Auto-reply z `@react-email/components` template.

## Konsekwencje

### Pozytywne

- Zero martwych integracji w MVP — preview deploys działają bez kluczy.
- Rate limit + Zod + CSRF off-the-shelf dają solidną ochronę.
- Field errors auto-mapowane na ARIA `aria-describedby` (`useId` + `${id}-err`).
- Migracja na Resend = zmiana TODO bloku, bez refactoru reszty.

### Negatywne / koszty

- Brak persystencji briefów do etapu 2 (wymaga DB lub Sheets API). MVP zaakceptowany — strategia mówi o weryfikacji konwersji, więc nawet stub ze success message daje sygnał.
- Rate limit in-memory ≠ persistent — w środowisku serverless (Vercel Functions) per-instance limit, nie globalny.

### Neutralne

- Decyzja o NIP regex tylko `\d{10}` (bez sumy kontrolnej) — pomyłki łapie etap 2 (Sage/Wave Apps weryfikuje przy FV). Mniej tarcia w MVP.

## Rozważone alternatywy

1. **API Route + react-hook-form** — odpada: dwa razy walidacja (client RHF + server route), więcej kodu, brak natywnego progressive enhancement.
2. **Wpięcie Resend od razu** — odpada: brak DPA + brak klucza w preview = błędy w runtime. Stabilność > pośpiech.
3. **Convex / Sanity custom mutation** — odpada na MVP: dodatkowy provider, dodatkowy DPA, koszt onboardingu.

## Linki

- ADR-0010 (PostHog).
- Reguła 55-security § input validation, rate limiting.
- Reguła 60-quality § stabilność, timeouty.
