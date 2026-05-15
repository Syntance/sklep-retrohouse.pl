# ADR-0009: Google Maps przez `<iframe>` (lazy) zamiast Mapbox/JS API

- **Status**: accepted
- **Data**: 2026-05-15
- **Autor**: RetroHouse / Senior Creative Dev

## Kontekst

Strona `/o-nas` ma sekcję "Sklep stacjonarny w Nowym Targu" i jednym z konwersji w funnel Flow 3 (lokalizacja → wizyta) jest "pokaż dojazd". Reguła 50-perf-a11y dyktuje LCP < 2s, INP < 200ms. Reguła 55-security: zero zewnętrznych skryptów bez SRI, każdy 3rd-party fetch z timeout.

Opcje:
- Mapbox + `react-map-gl` — własny styl, fallback offline, ale wymaga tokenu, ~150 KB JS, koszt billowy przy ruchu.
- Google Maps JS API + Marker — natywny look, ale 100+ KB JS, narzut INP, wymóg consent (Google = USA, Schrems II ryzyko).
- `<iframe>` z `https://www.google.com/maps?q=...&output=embed` — zero JS po stronie, lazy load, brak tokenu.

## Decyzja

`<iframe>` Google Maps z parametrami:

- `loading="lazy"` — iframe nie ładuje się aż user nie doscrolluje.
- `referrerPolicy="no-referrer-when-downgrade"` — Google dostaje minimalny referrer.
- `title` opisujący lokalizację (a11y).
- `aspect-[4/3]` ramka z border + shadow zamiast custom marker.
- Link "Pokaż dojazd" obok mapy → `https://maps.google.com/?q=...` w nowym oknie + emit `map_directions_clicked` w PostHog.

Konfiguracja adresu w `STORE_INFO`:
- `googleMapsEmbedSrc` — string URL z `output=embed`.
- `geo: { lat, lng }` — pod schema.org LocalBusiness JSON-LD (PR 6).
- `streetAddress`, `postalCode`, `city`, `country` — pod LocalBusiness.

## Konsekwencje

### Pozytywne

- Zero dodatkowego JS w bundlu (waga + INP) — iframe to oddzielny browsing context.
- Lazy load → sekcja powyżej nie jest blokowana.
- Brak tokenu / konfiguracji billowej.
- Klient Google Maps natywny dla użytkownika ("zna interfejs").

### Negatywne / koszty

- Brak custom markera / własnego stylu (Google brand).
- iframe = oddzielny request → dodatkowa preconnect do `maps.google.com` w HTML head wskazana przy ulgi LCP (TODO: dodać w `app/layout.tsx` gdy to stanie się sekcją hero).
- Brak heatmapy klików w mapie (consent + lubo iframe nie raportuje events).

### Neutralne

- Migracja na Mapbox prosta — wymiana komponentu `<StoreMap>` na nowy bez zmian w stronie.

## Rozważone alternatywy

1. **Mapbox + react-map-gl** — odpada na MVP: ~150 KB JS, token, więcej setup'u niż wartości dla 1 lokalizacji.
2. **Google Maps JS API + AdvancedMarkerElement** — odpada: wymaga consent gate (Google jako processor), narzut INP.
3. **Statyczna mapa SVG** (OSM eksport) — odpada: brak interakcji + Polacy "wiedzą" Google Maps; UX strata.

## Linki

- ADR-0010 (PostHog scope) — `map_directions_clicked` definition.
- Reguła 50-perf-a11y (lazy iframes).
- Google Maps embed docs: https://developers.google.com/maps/documentation/embed
