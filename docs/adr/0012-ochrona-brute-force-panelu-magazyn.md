# 0012 — Ochrona brute-force panelu /magazyn kończy się na brzegu Medusy

Data: 2026-09-04
Status: zaakceptowany (z otwartym zadaniem po stronie infrastruktury)

## Kontekst

Panel `/magazyn` loguje się przez Medusa Admin API. `loginEmailAction`
(`src/lib/admin/auth-actions.ts`) ma rate-limit per IP: Upstash Redis, a przy
jego braku lub błędzie limiter in-memory (`src/lib/admin/login-rate-limit.ts`).
Do tego działa allowlista `MAGAZYN_ADMIN_ALLOWLIST`, egzekwowana zarówno przy
wydaniu sesji, jak i przy każdym odczycie panelu (`requireAdminSession`
w layoucie `(panel)` i we wszystkich mutujących Server Actions).

Audyt bezpieczeństwa (2026-09-04) wykazał, że **ten limiter da się pominąć
w całości**. Backend Medusy jest publicznie osiągalny (`MEDUSA_BASE_URL`
pochodzi z `NEXT_PUBLIC_MEDUSA_BACKEND_URL`), a jego endpoint
`POST /auth/user/emailpass` jest otwarty. Atakujący zgaduje hasło bezpośrednio
na Medusie i nigdy nie dotyka naszego formularza ani naszego limitera.

Zdobyty w ten sposób token wystarcza do wejścia: wartością cookie
`rh_admin_session` jest surowy JWT Medusy, więc można go po prostu podstawić
w swoim kliencie. Allowlistę na ścieżce odczytu już dodaliśmy — to odcina
konta spoza listy — ale **nie zatrzymuje zgadywania hasła konta, które na
liście jest**.

## Rozważane opcje

1. **Mocniejszy limiter w storefroncie** — nic nie daje. Atak omija Next.js.
2. **Odejście od surowego JWT: własny rekord sesji po stronie serwera** —
   ogranicza podstawienie cookie, ale nadal nie chroni samego endpointu
   Medusy przed zgadywaniem haseł.
3. **Limit i blokada na brzegu przed Medusą** (Cloudflare Rate Limiting /
   WAF na `/auth/*`, albo limiter w samej Medusie) — jedyne miejsce, przez
   które atak faktycznie przechodzi.
4. **MFA na kontach admina Medusy** — usuwa wartość zgadniętego hasła.

## Decyzja

Przyjmujemy 3 + 4 jako właściwe rozwiązanie, realizowane **poza tym
repozytorium**. W storefroncie zostawiamy limiter jako obronę w głąb
(chroni przed najprostszym atakiem na nasz formularz) i nie udajemy, że
jest wystarczający.

## Konsekwencje

- Limiter w `login-rate-limit.ts` NIE jest kompletną ochroną brute-force.
  Nie usuwać go, ale też nie traktować jako spełnienia wymogu.
- Do zrobienia po stronie infrastruktury:
  - Cloudflare Rate Limiting na `/auth/*` backendu Medusy (np. 10 prób /
    10 min / IP), z blokadą i alertem.
  - MFA / passkeys na kontach administratorów Medusy.
  - Alert na serię nieudanych logowań w logach Medusy.
- `MAGAZYN_ADMIN_ALLOWLIST` ustawiona na produkcji jest wymagana — pusta
  wyłącza ograniczenie (fallback wsteczny, patrz `src/lib/admin/allowlist.ts`).
- Docelowo warto zamienić surowy JWT w cookie na własny rekord sesji, żeby
  wygaszanie dostępu nie zależało wyłącznie od czasu życia tokenu Medusy.
