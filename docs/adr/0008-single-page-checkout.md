# ADR-0008: Single-page checkout (Dane / Wysyłka / Płatność na jednej stronie)

- **Status**: accepted
- **Data**: 2026-05-15
- **Autor**: RetroHouse / Senior Creative Dev

## Kontekst

Strategia Notion mówi o "3 krokach checkoutu":
1. Koszyk (`/koszyk`).
2. Dane / Wysyłka / Płatność (`/koszyk/checkout`).
3. Gotowe (`/dziekujemy`).

W praktyce można to zrealizować dwiema ścieżkami:

- **Multistep** — osobna strona / route per krok (`/checkout/data`, `/checkout/shipping`, `/checkout/payment`). Każdy krok ma własny submit, własny URL.
- **Single-page** — jeden formularz na `/koszyk/checkout` z trzema fieldsetami (Dane → Wysyłka → Płatność), single submit.

## Decyzja

Single-page checkout jako default na MVP.

Powody:
1. **Mniej tarcia w MVP.** Każdy step page = dodatkowa strona z opóźnieniem nawigacji + ryzyko abandonment przy każdym przejściu (Baymard Institute: average drop 5–8% per step). Single page przy unikatowych produktach (sklep ma 1 sztukę każdego) = chcemy zamknąć transakcję jak najszybciej.
2. **Naturalne dla małego koszyka.** Średni koszyk RetroHouse wg strategii: 1.6 produkta. To nie e-commerce dla 50 SKU — multistep daje wartość dopiero powyżej średnio 4–5 produktów.
3. **Mniej kodu, mniej state.** Brak potrzeby cookie/session storage między krokami, brak Server Actions per krok. Jeden formularz = jedna walidacja Zodem przy submit (etap 2: Medusa).
4. **Łatwiejszy tracking.** `checkout_step_completed` strzelamy gdy user kończy interakcję z fieldsetem (focus out + radio change). PostHog widzi pełen funnel bez dodatkowego router instrumentowania.

## Konsekwencje

### Pozytywne
- Krótszy czas do "Zapłać bezpiecznie".
- Mniej Server Actions, mniej kodu w stabilności.
- Pełen progressbar 3-krokowy (Koszyk → Dane/Wysyłka/Płatność → Gotowe) zgodny ze strategią.

### Negatywne
- Mobile UX: długa strona (3 fieldsety). Mitigation: `lg:sticky` aside z podsumowaniem + smooth scroll do następnego błędu walidacji.
- A/B test 3-step vs 1-step nie został zrobiony — gdy będziemy mieć 200 zamówień/mies., warto zrobić eksperyment przez PostHog Feature Flags. Wynik decyduje na etap 2.
- Trudniejsze breadcrumbing w ścieżce w środku checkoutu — mitigation: progressbar + eyebrow "Krok 2 z 3" i etykieta sekcji "1 · Dane / 2 · Dostawa / 3 · Płatność".

### Neutralne
- Strategia Notion dopuszcza obie wersje — istotne jest, by tracking zachował 3 punkty kontrolne (`checkout_step_completed: data | shipping | payment`).

## Rozważone alternatywy

1. **Multistep z osobnymi route** — odpada na MVP (więcej kodu, więcej tarcia, brak danych dla A/B).
2. **Wizard inline (jeden URL, ale `useState` przełącza step)** — odpada: użytkownik nie może wrócić do "Dane" jednym scrollem, gubi context.
3. **Express checkout (BLIK + adres odzyskany z poprzedniego zamówienia)** — etap 2, gdy będzie dane historyczne.

## Linki

- Reguła 50-perf-a11y § INP < 200ms (multistep dodaje hydration na każdy step).
- ADR-0007 (Server Actions + Zod).
- ADR-0010 (PostHog tracking checkout_step_completed).
