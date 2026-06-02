# Runbook — Railway Disaster Recovery (Medusa)

Symptomy, którym zapobiega ten dokument: po restarcie / wygaśnięciu planu / redeployu Railway
**znikają zdjęcia produktów** (404 na `/static/...`), a w skrajnym przypadku **dane** (produkty,
zamówienia), jeśli baza leży w tym samym kontenerze co aplikacja.

Powód: kontener aplikacji na Railway ma **efemeryczny dysk** — wszystko zapisane lokalnie
(`/static/`, plik SQLite, dane Postgresa w kontenerze) ginie przy każdym restarcie.

Zasada docelowa: **kontener Medusa = tylko kod**. Zero ważnych danych na jego dysku.

---

## 1. Co gdzie żyje (mapa trwałości)

| Warstwa | Miejsce | Przetrwa restart Railway? |
|---|---|---|
| Produkty, ceny, zamówienia, klienci | PostgreSQL (osobny serwis / Neon) | TAK — jeśli baza jest osobnym serwisem |
| Zdjęcia produktów / uploady | Cloudflare R2 (lub S3) | TAK — po migracji z `/static/` |
| Frontend sklepu | Vercel | TAK — niezależny od Railway |
| Treści CMS (hero, blog) | Sanity | TAK |
| Maile transakcyjne | Resend | TAK |
| Sesje admina, cache | proces / Redis | nieistotne (odtwarzalne) |

Jeśli którakolwiek z dwóch pierwszych warstw siedzi **na dysku kontenera Medusa** — to jest
dziura DR. Kroki 2 i 3 ją zamykają.

---

## 2. Zdjęcia → Cloudflare R2 (priorytet 1)

R2: S3-compatible, region EU, ~10 GB/mies. w darmowym progu. Mamy już Cloudflare (DNS).

### 2.1 Cloudflare (jednorazowo)
1. R2 → **Create bucket**, np. `retrohouse-products`.
2. Bucket → **Settings → Public access** → podłącz **Custom Domain**
   (np. `assets.sklep-retrohouse.pl`). To jest publiczny URL serwowania obrazów (z CDN).
3. R2 → **Manage API Tokens** → utwórz token **Object Read & Write** ograniczony do bucketu.
   Zapisz `Access Key ID`, `Secret Access Key`, `Account ID`.

### 2.2 Backend Medusa (repo `sklep-retrohouse-pl-medusa`)
W `medusa-config.ts` zastąp lokalny storage providerem S3 (R2 jest S3-compatible):

```typescript
{
  resolve: "@medusajs/medusa/file",
  options: {
    providers: [
      {
        resolve: "@medusajs/medusa/file-s3",
        id: "s3",
        options: {
          file_url: process.env.S3_FILE_URL,        // https://assets.sklep-retrohouse.pl
          access_key_id: process.env.S3_ACCESS_KEY_ID,
          secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
          region: "auto",
          bucket: process.env.S3_BUCKET,             // retrohouse-products
          endpoint: process.env.S3_ENDPOINT,         // https://<ACCOUNT_ID>.r2.cloudflarestorage.com
          prefix: "products",
          cache_control: "public, max-age=31536000, immutable",
          additional_client_config: {
            forcePathStyle: true,
          },
        },
      },
    ],
  },
},
```

ENV w Railway (serwis Medusa):

```env
S3_FILE_URL=https://assets.sklep-retrohouse.pl
S3_BUCKET=retrohouse-products
S3_ENDPOINT=https://TWOJ_ACCOUNT_ID.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

> Uwaga: R2 nie obsługuje S3 ACL. Dla samego serwowania zdjęć produktów (publiczny bucket)
> oficjalny `file-s3` wystarcza. Gdyby w przyszłości potrzebne były pliki prywatne + presigned
> URL, użyj pluginu dual-bucket (`@webbers/cloudflare-r2-medusa`).

### 2.3 Storefront (to repo — JUŻ ZROBIONE)
- `NEXT_PUBLIC_MEDIA_CDN_URL` w env → dodawane do `images.remotePatterns` w `next.config.ts`.
  Po wdrożeniu R2 ustaw w Vercel: `NEXT_PUBLIC_MEDIA_CDN_URL=https://assets.sklep-retrohouse.pl`.
- Karta produktu i galeria PDP mają **fallback gradientowy** przy 404 obrazu — pad backendu
  nie psuje już layoutu (puste/zepsute `<img>`), tylko pokazuje gradient z palety produktu.

### 2.4 Migracja istniejących zdjęć
Stare uploady z `/static/` przepadły wraz z dyskiem. Po włączeniu R2 wgraj zdjęcia ponownie
w panelu `/magazyn/produkty` (edycja produktu → usuń martwe → dodaj → zapisz). Nowe trafią do R2.

---

## 3. Baza danych → osobny serwis + backupy (priorytet 1)

### 3.1 Weryfikacja
W Railway Dashboard sprawdź, czy **PostgreSQL to osobny serwis** (plugin), a nie baza wewnątrz
kontenera Medusa. `DATABASE_URL` w Medusa musi wskazywać na ten osobny serwis.

- Osobny serwis Railway Postgres → dane przeżywają restart aplikacji. OK.
- Rekomendacja długoterminowa: **Neon** (EU, branching, automatyczne backupy PITR, łatwy failover).

### 3.2 Backupy bazy
Niezależnie od hosta rób **własny** zrzut do R2 (zasada: backup w innym cloudzie niż produkcja).
Skrypt: `scripts/backup-medusa-db.sh` (pg_dump → gzip → R2, z retencją).

Harmonogram (zgodnie z `.cursor/rules/90-release.mdc`):
- **codziennie** — automatyczny zrzut + retencja 30 dni,
- **tygodniowo** — pełny eksport (ten sam skrypt, osobny prefix),
- **co kwartał** — test restore na staging („nieprzetestowany backup = brak backupu”).

Uruchomienie jako Railway Cron Service (osobny serwis, harmonogram `0 3 * * *`) albo z GitHub
Actions (sekrety w repo). Wymaga `pg_dump` (klient Postgres) + `aws` CLI (R2 przez endpoint).

---

## 4. Procedura RESTORE

### 4.1 Zdjęcia
Z R2 nic nie trzeba odtwarzać — bucket jest trwały. Gdyby bucket został skasowany: odtwórz z
replikacji (krok 5) lub wgraj zdjęcia ponownie w `/magazyn`.

### 4.2 Baza
```bash
# 1. Pobierz najnowszy zrzut z R2
aws s3 cp s3://retrohouse-backups/db/daily/<plik>.sql.gz ./restore.sql.gz \
  --endpoint-url "$R2_ENDPOINT"

# 2. Rozpakuj i wgraj do (NOWEJ / czystej) bazy
gunzip -c ./restore.sql.gz | psql "$TARGET_DATABASE_URL"
```
Następnie przełącz `DATABASE_URL` Medusy na odtworzoną bazę i zrestartuj serwis.

RTO docelowe: baza 30 min, pełny serwis 2 h (za `90-release.mdc`).

---

## 5. Backup / replikacja R2 (priorytet 2)

- Włącz **wersjonowanie obiektów** na buckecie produktowym (ochrona przed nadpisaniem/skasowaniem).
- Replikacja co 24 h do drugiego bucketu (np. `retrohouse-products-dr`) — Cloudflare R2
  bucket-to-bucket lub cron `aws s3 sync`.

---

## 6. Checklista wdrożenia (kolejność)

1. [ ] R2 bucket + custom domain + token (krok 2.1).
2. [ ] `file-s3` + ENV w backendzie Medusa, deploy (krok 2.2).
3. [ ] `NEXT_PUBLIC_MEDIA_CDN_URL` w Vercel + redeploy storefront (krok 2.3).
4. [ ] Ponowny upload zdjęć w `/magazyn` (krok 2.4).
5. [ ] Potwierdź, że Postgres to osobny serwis; ustaw `DATABASE_URL` (krok 3.1).
6. [ ] Wdróż `scripts/backup-medusa-db.sh` jako cron; pierwszy zrzut ręcznie (krok 3.2).
7. [ ] Test restore na staging (krok 4) — w ciągu kwartału.

## 7. Czego NIE robić

- Nie trzymać uploadów na dysku kontenera Medusa (`/static/`).
- Nie polegać wyłącznie na Railway Volume jako jedynej ochronie (brak CDN, trudniejszy backup).
- Nie zakładać, że „produkt jest w panelu = zdjęcie też jest” — to baza vs storage, dwa miejsca.
