# ADR-0001: Core stack — Next.js 16 + React 19 + Tailwind v4 + Biome

- **Status**: accepted
- **Data**: 2026-05-01
- **Autor**: Kamil Podobiński

## Kontekst

Sklep retrohouse.pl ma być wizualnie premium (benchmark: Awwwards SOTD), z hero momentem 3D / motion, ale jednocześnie indeksowalny przez Google i performance-first (LCP < 2.0s, INP < 200ms). Stack musi pokrywać:

- statyczny content (SSG), dynamiczne sekcje (RSC streaming),
- 3D + animacje bez bloata initial bundle (< 200 KB gz per route),
- DX dla solo-deva (typed everything, jeden formatter+linter, fast HMR),
- target deploy: Vercel (region `fra1`, najbliżej PL).

## Decyzja

- **Next.js 16** App Router + **React 19** (RSC default, `"use client"` tylko gdy potrzeba).
- **TypeScript 5.x** strict, `noUncheckedIndexedAccess` dodajemy w fazie 2 gdy domena ustabilizuje typy.
- **Tailwind v4** + CSS variables (OKLCH, nie HSL — zgodnie z `20-design.mdc`).
- **Biome 2.x** — jeden tool zamiast ESLint + Prettier (10× szybszy, jeden config).
- **Shadcn/ui** dla Button/Form/Dialog/Sheet/Tabs (nie wszystko).
- **pnpm** strict (`preinstall: only-allow pnpm` blokuje npm/yarn).
- Animacje hierarchia: CSS → Framer Motion → GSAP/ScrollTrigger → Theatre.js (zgodnie z `30-motion.mdc`).
- 3D: R3F + drei + postprocessing, zawsze `dynamic({ ssr: false })`.

## Konsekwencje

### Pozytywne

- React 19 RSC — domyślnie zero JS dla content-heavy stron.
- Next 16 turbopack — instant HMR.
- Tailwind v4 — natywne CSS vars, zero config JS.
- Biome — jeden lint+format+check, brak konfliktu plugins.
- pnpm — najszybszy install + content-addressable store.

### Negatywne / koszty

- Next 16 świeży (breaking changes vs. 15) — niektóre ekstensje może nie nadążać.
- Biome nie ma 100% pokrycia ESLint plugins (np. `eslint-plugin-jsx-a11y` — ręczna kompensacja przez Playwright a11y testy).
- Tailwind v4 młoda — niektóre community pluginy jeszcze nie wspierają.

### Neutralne

- Vendor lock-in na Vercel (`@vercel/analytics`, `@vercel/speed-insights`) — akceptowalne, hosting Vercel.

## Rozważone alternatywy

1. **Astro** — odrzucone: słabszy ekosystem React 19, gorsze RSC.
2. **Remix / React Router v7** — odrzucone: słabsza integracja Vercel + Sentry niż Next.
3. **ESLint + Prettier** — odrzucone: 2 narzędzia, wolniejsze, więcej configu.

## Linki

- `.cursor/rules/00-core.mdc`, `10-stack.mdc`, `20-design.mdc`, `30-motion.mdc`, `40-3d.mdc`
- Next 16 docs: `node_modules/next/dist/docs/`
