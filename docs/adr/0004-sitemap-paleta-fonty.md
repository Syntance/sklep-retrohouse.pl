# 0004 — Mapa serwisu, paleta OKLCH, typografia (warstwa designerska v1)

- **Status**: Accepted
- **Data**: 2026-05-01
- **Autorzy**: Kamil Podobiński + Senior Creative Developer (AI pair)
- **Powiązane**: 0001-core-stack, 0003-cms-sanity, brandbook + strategia w Notion
  („RetroHouse — strategia jest strategia strony")

## Kontekst

RetroHouse to sklep z autentycznymi antykami i vintage z Wiednia z fizycznym
salonem w Nowym Targu. Drugą — równie ważną — grupą docelową są projektanci
wnętrz i architekci (B2B). Strategia w Notion definiuje:

- ton („luksus dostępny", „zatrzymany czas", „rzemiosło ponad chaos"),
- paletę kolorów (kość słoniowa #FAF7F2, niebieski wiedeński #2C4A6E,
  mosiądz #C5A55A, zieleń butelkowa #2D5F3E, ciemny grafit #2A2A2A, ciepła
  szarość #E8E2D9),
- typografię (Display: Playfair Display dla tytułów, Sans: Inter dla treści),
- 8 kanonicznych podstron + 3 strony prawne.

Reguły workspace (00-core, 20-design) wymagają **OKLCH zamiast hex**, **next/font**
zamiast linkowania CDN, **brak stock fontów bez justyfikacji** i **first-frame
contract** dla każdej strony.

## Decyzja

### A. Mapa serwisu (sitemap v1)

Routes App Router (Next 16):

| Route                       | Render | Cel biznesowy                                       |
| --------------------------- | ------ | --------------------------------------------------- |
| `/`                         | static | Hero, kategorie, bestsellery, story, social proof   |
| `/sklep`                    | dyn.   | Filtry (kategoria/cena/epoka/sort) z `searchParams` |
| `/sklep/[slug]`             | SSG    | PDP (galeria, story, schema.org Product, related)   |
| `/koszyk`                   | static | Lista pozycji + upsell + progress bar               |
| `/koszyk/checkout`          | static | Dane → wysyłka → płatność (1 strona, 3 sekcje)      |
| `/dziekujemy`               | dyn.   | Order ID + timeline + IG/newsletter                 |
| `/o-nas`                    | static | Story, założyciele, salon w Nowym Targu, wartości   |
| `/kontakt`                  | static | Mapa, formularz, FAQ + JSON-LD `LocalBusiness`      |
| `/blog`                     | dyn.   | Filtr po kategorii, featured + grid                 |
| `/blog/[slug]`              | SSG    | Artykuł (placeholder pod Sanity PortableText)       |
| `/prezent`                  | static | Filtr budżetowy, bestsellery prezentowe             |
| `/wysylka`                  | static | Tabela kosztów, reklamacje, FAQ                     |
| `/dla-projektantow`         | static | B2B (FV, 14 dni rezerwacji, brief)                  |
| `/regulamin`                | static | Legal placeholder, _draft, do review prawnego_      |
| `/polityka-prywatnosci`     | static | Legal placeholder, _draft, do review prawnego_      |
| `/deklaracja-dostepnosci`   | static | EAA + WCAG 2.2 AA placeholder                       |

Build: 37 prerenderowanych stron, 3 ƒ dynamic (`/blog`, `/dziekujemy`, `/sklep`).

#### Konsekwencje
- Sklep + blog są w 100% URL-driven (filtry przez `searchParams`) — możemy
  indeksować konkretne kombinacje filtrów i robić canonicale w Sanity gdy CMS
  wjedzie.
- 3 strony prawne wymagają audytu prawnego przed prod (zaznaczone w body).

### B. Paleta OKLCH (mapowanie z brandbook)

Wszystkie kolory w `src/app/globals.css` jako CSS variables OKLCH (rule 20-design):

```text
Surface (kość słoniowa)  #FAF7F2 → oklch(0.97 0.012 80)
Ink (grafit)             #2A2A2A → oklch(0.27 0.005 280)
Akcent niebieski         #2C4A6E → oklch(0.39 0.06  245)   /* primary */
Akcent mosiądz           #C5A55A → oklch(0.74 0.10  80)    /* accent / brass */
Zieleń butelkowa         #2D5F3E → oklch(0.43 0.07  150)   /* success */
Ciepła szarość           #E8E2D9 → oklch(0.91 0.014 70)    /* secondary */
Ceglany destructive               oklch(0.55 0.18  28)
```

W trybie dark `--primary` przesuwa się na **mosiądz** (lepszy kontrast na
ciemnym tle), niebieski wiedeński cofa się do akcentu — obrazy obiektów
„grają" lepiej na grafitowym tle.

Token `--ring` to mosiądz z alpha 0.6 — focus jest jednolicie ciepły niezależnie
od tła i nie przeszkadza w obrazach.

#### Konsekwencje
- Zero `#000` / `#FFF` w kodzie aplikacji (rule 00-core).
- Cały kod app-side używa Tailwind v4 token classes (`bg-background`,
  `text-foreground`, `border-border`, `text-brass`, …) — nigdy `bg-[#xxx]`.
- Kontrast tekst ↔ tło: text foreground na background = 11.5:1 (WCAG AAA).
- Ring offset 4px na linkach + 2px na inputach — focus nie kolizjuje z hover.

### C. Typografia (next/font)

```ts
Inter             — variable `--font-inter`,    subsets pl + ext, opsz axes
Playfair Display  — variable `--font-playfair`, weights 400–800, italic on
```

- `--font-sans` = `--font-inter` (body, UI, mikro).
- `--font-display` = `--font-playfair` (h1/h2/h3, eyebrows nie — brass uppercase).
- `font-feature-settings: "ss01", "ss02", "kern", "liga"` na body.
- Display ma `text-wrap: balance` + `letter-spacing: -0.02em` na h1.
- Tabular-nums helper class `.tabular` dla cen i dat (zgodność z TD-7
  „liczby w tabeli").

#### Konsekwencje
- Inter to default, ale używany **z opsz axes** — nie generic Inter z CDN.
  Spełnia rule 00-core (nie używamy stock fontów bez justyfikacji).
- Playfair daje wyrazistość oczekiwaną przez brandbook („luksus dostępny").
  Ma autentyczny kursywę (italic style `true`), używaną w eyebrowach typu
  „Każda historia ma swój początek".
- next/font: 0 layout shift, 0 CDN call do Google fonts, CLS = 0.

### D. Iconografia

Custom set 20 ikon w `src/components/icons/index.tsx`:
stroke-width 1.5, rounded line caps, viewBox 24×24, `currentColor` na stroke.
**Zero Lucide / Heroicons w hero / nav** (rule 00-core: zero stock).

## Alternatywy rozważane

1. **Tylko Inter (jeden font)** — ekonomicznie najlepiej, ale brandbook żąda
   serifa display'owego dla „zatrzymanego czasu". Odrzucone.
2. **Cormorant Garamond zamiast Playfair** — bardziej archaiczny, ale gorszy
   rendering w małych rozmiarach (h3, eyebrow). Odrzucone.
3. **Hex zamiast OKLCH** — łatwiejszy onboarding, ale rule 20-design + przyszły
   Tailwind v5 (relative colors) wymagają OKLCH. Odrzucone.
4. **Filtry sklepu w state Zustand** — szybsze, ale tracimy SEO + URL share.
   Odrzucone na rzecz `searchParams`.

## Konsekwencje (suma)

- Pełna mapa serwisu wpięta i builduje się statycznie.
- Każda decyzja designerska jest backed by token w `globals.css` —
  CMS edytor nie może „naprawić" koloru w treści; design jest immune.
- ADR-0005 (najbliższe) powinno opisać **integrację Sanity** i mapping
  PortableText → Tailwind classes.
- TODO przed prod:
  - [ ] PNG/SVG faktycznych zdjęć produktów (zamiast gradient placeholderów).
  - [ ] Audyt WCAG 2.2 AA na każdej z 16 stron (axe DevTools + manual VO).
  - [ ] Treść regulaminu + polityki prywatności + deklaracji dostępności
    (kancelaria/audyt).
  - [ ] Lighthouse mobile/desktop ≥ 90/95/100 na home + PDP.
