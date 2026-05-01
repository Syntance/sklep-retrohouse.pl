# ADR-0003: CMS — Sanity dla treści sklepu retrohouse.pl

- **Status**: accepted
- **Data**: 2026-05-01
- **Autor**: Kamil Podobiński

## Kontekst

Sklep B2C potrzebuje edytowalnego contentu bez deployu frontu: landing hero copy, sekcje marketingowe, artykuły (SEO), opcjonalnie rich PDP beyond Medusa core (jeśli Medusa wejdzie później — nie jest częścią tej decyzji).

Stack rule `10-stack.mdc` definiuje domyślnie **Sanity** dla portfoliów + content-heavy sites, **Payload** gdy dev kontroluje schema + self-hosted na tym samym deploy co app z auth + custom admin logiką.

## Decyzja

**Sanity** jako headless CMS dla marketing contentu i SEO.

- Studio embedowane pod `/studio` w Next.js (jeden deploy na Vercel).
- Schema w TypeScript, Portable Text dla rich copy.
- Live preview + visual editing (`next-sanity` już w deps).
- Dataset domyślny `production`, osobny `staging` przed publikacją (konfiguracja ENV).

Produkty i checkout pozostają poza CMS do czasu integracji commerce (Medusa / Stripe / InPost) — osobny ADR.

## Konsekwencje

### Pozytywne

- Copy/design mogą iterować bez PRów od deva (Studio permissions).
- CDN dla assetów (`cdn.sanity.io`), transform images przez URL lub pipeline Cloudinary.
- Silny DX (TypeGen, GROQ, struktura treści w repo jako kod schema).

### Negatywne / koszty

- Vendor SaaS (billing po growth — akceptowalne dla launch).
- Radix preview URLs / sekrety (`SANITY_API_READ_TOKEN`) — rotation policy potrzebna.
- Drugi system truth dla treści — synchronizacja semantyczna z PDP (gdy commerce live).

### Neutralne

- `next-sanity` ciągnie ciężkie transitive deps (`sanity`, `@sanity/cli`) — monitorować `pnpm audit`, overrides w `package.json` jeśli CVE w łańcuchu.

## Rozważane alternatywy

1. **Payload CMS** — odrzucone na launch: self-hosted Postgres + więcej surface area security/backup; sensowne gdy jeden backend z custom auth/admin dla operatorów magazynu.
2. **MDX-only** — odrzucone: treść nie skaluje dla klienta/copy bez git workflow.
3. **WordPress headless** — odrzucone per `10-stack.mdc` (legacy).

## Linki

- `10-stack.mdc` — „CMS — kiedy co”
- ENV: `.env.example`, `src/env.ts`
- Plan: `/studio` route + `sanity.config.ts` + pierwsze schema types (ProductStory, PageSection)
