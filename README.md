# sklep-retrohouse.pl

Sklep retrohouse.pl — Next.js 16 App Router + React 19 + Tailwind v4.

## Stack

- **Framework**: Next.js 16 + React 19 (RSC default)
- **Style**: Tailwind v4 + CSS variables (OKLCH) + shadcn/ui
- **Animacje**: Framer Motion / GSAP / Theatre.js / Lenis (zgodnie z `.cursor/rules/30-motion.mdc`)
- **3D**: React Three Fiber + drei + postprocessing
- **Forms**: React Hook Form + Zod
- **State**: Zustand + nuqs (URL state)
- **CMS**: **Sanity** (ADR-0003 — `/studio`, schema TS, preview)
- **Media**: Cloudinary (`next-cloudinary`)
- **Observability**: Sentry + PostHog (EU) + Vercel Speed Insights/Analytics
- **Lint+format**: Biome 2
- **Test**: Vitest + Playwright
- **Pakiety**: pnpm 10 (strict, blokuje npm/yarn)

Reguły projektu: `.cursor/rules/`. ADR: `docs/adr/`.

## Wymagania

- Node 24+
- pnpm 10+ (`corepack enable && corepack prepare pnpm@10.33.2 --activate`)

## Setup

```bash
pnpm install
cp .env.example .env.local   # uzupełnij wartości
pnpm dev
```

## Skrypty

| Komenda | Co robi |
|---|---|
| `pnpm dev` | Dev server (turbopack) na `localhost:3000` |
| `pnpm build` | Production build |
| `pnpm build:analyze` | Build + bundle analyzer (`ANALYZE=true`) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | `biome lint .` |
| `pnpm lint:fix` | `biome lint --write .` |
| `pnpm format` | `biome format --write .` |
| `pnpm check` | `biome check .` (lint + format combined) |
| `pnpm test` | Vitest (jednorazowo) |
| `pnpm test:watch` | Vitest watch |
| `pnpm test:e2e` | Playwright E2E |
| `pnpm knip` | Wykryj martwe eksporty / unused deps |

## Deploy

- **Hosting**: Vercel (team `syntance`, project `sklep-retrohouse-pl`)
- **Region**: `fra1` (Frankfurt — minimalne TTFB dla PL)
- **Auto-deploy**: push do `main` → production · PR → preview deploy
- **Pre-deploy checklist**: `.cursor/rules/90-release.mdc`

### Checklista po pierwszym deployu (Vercel Dashboard)

Tych ustawień nie zautomatyzujesz wiarygodnie samym `vercel` CLI na Hobby/Pro bez dodatkowych tokenów API — ustaw jednorazowo w dashboardzie:

1. **Speed Insights** — Project → Speed Insights → **Enable** (kod `<SpeedInsights />` już w `layout.tsx`).
2. **Web Analytics** — Project → Analytics → **Enable** (kod `<Analytics />` już w `layout.tsx`).
3. **Environment Variables** — Project → Settings → Environment Variables:
   - `NEXT_PUBLIC_SITE_URL` = kanoniczny URL prod (np. `https://sklep.retrohouse.pl` lub assigned `.vercel.app` jeśli bez domeny).
   - pozostałe wg `.env.example` (Sanity, Cloudinary, Sentry, PostHog).
4. **Deployment Protection** — jeśli Production ma być publiczny bez SSO, wyłącz ochronę dla **Production** albo dodaj **custom domain** (DNS u rejestratora).
5. **Code scanning** — GitHub → Security → Code scanning — workflow `codeql.yml` uruchamia się automatycznie po pushu.

## Struktura

```
src/
  app/                 # routes (App Router)
  components/
    ui/                # shadcn primitives
    sections/          # sekcje stron (kebab-case folders)
    3d/                # sceny R3F
  lib/                 # helpery, utils
  env.ts               # T3 Env (walidacja env vars)
docs/
  adr/                 # Architecture Decision Records
  runbook/             # Incident playbooks
public/
  .well-known/
    security.txt       # RFC 9116
.github/workflows/     # CI
```

## Środowisko

ENV variables w `.env.example`. Walidacja Zod w `src/env.ts` — build fails gdy required brakuje. Skip w CI: `SKIP_ENV_VALIDATION=true`.

## A11y / Perf budget

- LCP < 2.0s · CLS < 0.05 · INP < 200ms
- WCAG 2.2 AA, EAA-compliant (od 28.06.2025)
- `prefers-reduced-motion: reduce` wyłącza parallax / scrub / autoplay / 3D auto-rotate

## Licencja

Proprietary — wszystkie prawa zastrzeżone.
