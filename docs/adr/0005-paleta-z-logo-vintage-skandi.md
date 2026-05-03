# 0005 — Paleta wyciągnięta z logo + estetyka „vintage + skandynawski"

- **Status**: Accepted
- **Data**: 2026-05-03
- **Autorzy**: Kamil Podobiński + Senior Creative Developer (AI pair)
- **Powiązane**: 0004-sitemap-paleta-fonty (zastępuje warstwę kolorystyczną)
- **Źródło**: Notion „Identyfikacja wizualna — brandbook" (aktualizacja 2026-05-03)

## Kontekst

Pierwsza wersja palety (ADR-0004) była rekonstrukcją „od zera" według ogólnego briefu
„antyki wiedeńskie": niebieski wiedeński (#2C4A6E) jako primary, mosiądz (#C5A55A)
jako accent, kość słoniowa (#FAF7F2) jako tło, grafit (#2A2A2A) jako tekst.
Wynik: poprawny technicznie, ale **wizualnie odklejony od logo** —
sygnet okrągły z meblem (komodą) i lampą używa zupełnie innych odcieni:
brązowy mebel, terakotowa lampa, beżowe tło.

Klient (właściciel marki) zaktualizował brandbook 2026-05-03 i zatwierdził **paletę
wyciągniętą wprost z logo**. Dodatkowo doprecyzował kierunek estetyczny:

> „Bardziej przyjazne, nowoczesne, ale nawiązujące do retro."

Interpretacja briefu:

- **vintage** (ciepło, patyna, historia, papier, light-first)
- **skandynawski** (czystość, dużo białego, prostota, przestrzeń, dyscyplina)
- **przyjazny** (zaokrąglone rogi, miękkie cienie, ciepłe akcenty, czytelność)

## Decyzja

### A. Paleta — z logo, OKLCH

```text
Główne (z logo)
- Terakota / palony pomarańcz   #B14A2A → oklch(0.52 0.15 38)   primary CTA, badge, ceny wyróżnione, linki
- Brąz orzechowy                #7B4A2E → oklch(0.39 0.07 45)   akcent secondary, ramki, ozdobniki
- Czerń złamana brązem          #2D1810 → oklch(0.18 0.025 35)  typografia, footer

Neutralne
- Biały                         #FFFFFF → oklch(1 0 0)          UI główne (karty, tła sekcji default)
- Beż / kość słoniowa (logo)    #CDB99F → oklch(0.78 0.04 70)   sekcje "papier" (hero, story)
- Krem jasny (klosz lampy)      #E8DCC0 → oklch(0.89 0.035 80)  alt sekcje, dividers, hover na białym

Ozdobnik (NIE primary)
- Mosiądz złoty                 #C5A55A → oklch(0.74 0.10 80)   linia separator, ramki ozdobne, eyebrow line

Status
- Zieleń butelkowa              #2D5F3E → oklch(0.43 0.07 150)  success
- Ceglany                                  oklch(0.55 0.18 28)  destructive
```

#### Tokeny semantyczne (CSS variables)

Oprócz standardowych shadcn tokenów (`--background`, `--foreground`, `--primary`,
`--accent`, `--muted`, `--border`, `--ring`, …) wprowadzam **tokeny brand**
do bezpośredniego użycia w kodzie:

```css
--terracotta / --terracotta-foreground
--walnut / --walnut-foreground
--paper / --paper-foreground
--cream / --cream-foreground
--ink / --ink-foreground
--brass / --brass-foreground
```

Każdy ma odpowiednik w Tailwind v4 (`bg-terracotta`, `text-walnut`, `bg-paper`, …).
Light + dark mode mają każdy te tokeny zdefiniowane (patrz `globals.css`).

Mapowanie shadcn → brand:
- `--primary = --terracotta`
- `--accent = --walnut`
- `--secondary = --paper`
- `--muted = --cream`

Dzięki temu shadcn componenty (Button, Form, Dialog) automatycznie respektują
brand bez modyfikacji.

### B. Tony sekcji

Dodaję `Section` primitive z 5 tonami (+ alias `muted`):

| Tone     | Tło                       | Użycie                                                   |
| -------- | ------------------------- | -------------------------------------------------------- |
| default  | biały                     | Sekcje produktowe, czyste neutral                        |
| paper    | beż #CDB99F               | Hero, storytelling, „o-nas" — najmocniej brand           |
| cream    | krem #E8DCC0              | Alt sekcje (bestsellery, social proof), mniej intensywna |
| ink      | czerń złamana brązem      | Footer, dramatic callout (Live drop, Newsletter CTA)     |
| accent   | terakota 12% alpha        | Banner promo / sale                                      |
| muted    | alias na cream            | Back-compat ze starym kodem                              |

Sekcje `paper` i `cream` mogą mieć `grain` prop — delikatna tekstura papieru
(radial dot pattern, 6% opacity, mix-blend-mode multiply). Dodaje „duszy"
w hero bez kosztu wydajności.

### C. Mosiężny separator dekoracyjny

Brandbook (sekcja „Styl wizualny — moodboard") wprost wymienia:

> „Akcentowa złota/mosiądz linia jako separator."

Stąd:
- klasa `.brass-rule` w `globals.css` — gradient mosiężny od transparent → 100% → transparent
- komponent `<BrassRule />` — wrapper z `max-w-md mx-auto` jako default
- Eyebrow ma w `::before` mosiężną linię + tekst w terakocie (dwa brand
  kolory w jednym akcentcie — wizualnie bogato)

Mosiądz **NIE jest aktywnym CTA color** — jest **dekoracją**. Aktywne to terakota.

### D. Typografia

Brandbook 2026-05-03 doprecyzował hierarchię:

| Element     | Font                       | Styl       | Rozmiar         |
|-------------|----------------------------|------------|-----------------|
| H1 (hero)   | **Playfair Display** serif | Bold       | 36–48px         |
| H2 (sekcje) | **Playfair Display**       | SemiBold   | 28–32px         |
| **H3**      | **Inter** sans             | SemiBold   | 20–24px         |
| Body        | Inter                      | Regular    | 16px / lh 1.6   |
| Captions    | Inter                      | Regular    | 14px            |
| CTA         | Inter                      | SemiBold   | UPPERCASE 14–16 |

**Zmiana w stosunku do ADR-0004**: H3 przeniesione z Playfair na Inter SemiBold.
Powód: Playfair w małych rozmiarach (h3 = 20–24px) traci czytelność, zwłaszcza
mix-cyrylica/diakrytyki polskie. Inter SemiBold zapewnia clarity przy zachowaniu
serifa w h1/h2 (gdzie Playfair lśni).

Body line-height = 1.6 (brandbook) zamiast domyślnego 1.5 — łatwiejsze czytanie.

### E. CTA — UPPERCASE Inter SemiBold

```css
.cta-text {
  font-family: var(--font-sans);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
```

`CtaLink` primitive ma 5 wariantów:
- `primary` — terakota fill, biały text (główny CTA na każdej stronie)
- `secondary` — biała ramka brąz orzechowy, terakota hover
- `ghost` — bez ramki, mała wersja inline (pod tekst)
- `underline` — link text z gradient underline (dla „Zobacz więcej")
- `dark` — odwrotny do primary (white-on-ink) — dla overlay na obrazie

### F. Border-radius i cienie

- `--radius` = `0.625rem` (10px) — środek brandbook 8–12px
- Cienie ciepłe **brąz-tinted** (nie szare) — vintage feel:
  ```css
  --shadow-md: 0 8px 20px -8px oklch(0.18 0.04 35 / 0.12);
  --shadow-card: 0 1px 0 0 oklch(0.18 0.04 35 / 0.04),
                 0 8px 24px -12px oklch(0.18 0.04 35 / 0.08);
  ```
- `bg-card` (na białym tle) ma subtle `shadow-card` zamiast border — czyste,
  skandynawskie, ale ciepłe.

## Alternatywy rozważane

1. **Zostawić starą paletę (niebieski wiedeński)**. Estetycznie bezpieczne, ale
   odklejone od logo. Klient explicit zatwierdził paletę z logo. **Odrzucone.**
2. **Mosiądz jako primary CTA**. Ciepły, vintage, ale w testach kontrastu
   `oklch(0.74 0.10 80)` na białym daje 2.1:1 — fail WCAG AA. Tekst byłby
   nieczytelny. **Odrzucone.**
3. **Beż jako default background (zamiast white)**. Bardziej brand, ale
   karty produktów (białe) wyglądały „pływające". Skandynawskie filary
   wymagają białego jako neutral. **Odrzucone** — beż jest zarezerwowany
   dla sekcji „paper" (hero, story).
4. **Tylko light mode**. Brand jest typowo light-first, ale dark
   zostawiamy jako accessibility fallback (system preference, low-light).
   **Zachowane**: dark = czerń złamana brązem #2D1810 jako tło, krem jako
   tekst, terakota wciąż primary (rozjaśniona dla kontrastu).

## Konsekwencje

### Pozytywne
- Wizualna spójność z logo — strona, IG, drukarnia, materiały sklepowe
  używają tych samych hex.
- Estetyka „vintage + skandynawski" naturalnie wpisana w tokens (nie
  per-strona override).
- Eyebrow + BrassRule + paper-grain dają wizualną głębię bez ciężaru.
- CTA terakota wybija się od dyskretnego beżowo-białego layoutu — wysoka
  conversion expected.

### Negatywne / koszty
- Wszystkie 16 podstron + komponenty layoutu wymagało refaktoru klas
  Tailwind (`bg-foreground` → `bg-ink`, `text-background` → `text-ink-foreground`,
  `bg-secondary/X` → `bg-cream`, etc.). 39 plików, ~40 zamian deterministycznych
  + 8 manualnych poprawek kontrastu. Bez dłużnika technicznego — paleta jest
  domknięta przez tokens.
- Stara dokumentacja (ADR-0004) zachowana dla kontekstu, ale superseded
  w sekcji „A. Paleta" przez ten ADR.

### TODO (poza tym ADR)
- [ ] Audyt kontrastu axe DevTools na wszystkich 16 stronach — terakota na
  beżu wymaga sprawdzenia (oczekiwane ~5:1, próg 4.5:1).
- [ ] Pierwsze realne zdjęcia produktów (zamiast gradient placeholderów) —
  z naturalnym ciepłym światłem i jednym z brand neutralnym tłem (drewno,
  len, kość słoniowa) wg brandbook „Styl zdjęć".
- [ ] Logo SVG jako finalny asset (`public/logo.svg` z 3 wariantami:
  pełny / sygnet / monochrome). Aktualnie używamy uproszczonego symbolu
  „dom" jako placeholder.
- [ ] Lighthouse mobile na home + PDP — verify że CSS variable-based palette
  nie wprowadziła regresji (oczekiwane: zero, bo to zmiana tokens, nie struktury).
