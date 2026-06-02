# Konfiguracja Medusa Backend - Cloudflare R2 Storage

## Przegląd

Medusa Backend (Railway template) domyślnie używa **local file storage** (dysk efemeryczny).
Ta konfiguracja migruje storage na **Cloudflare R2** (S3-compatible, persistent, CDN).

---

## Wymagania

- Medusa v2.x (Railway template)
- Pakiet npm: `@medusajs/file-s3` lub `@medusajs/file` (z S3 provider)
- R2 bucket + API credentials

---

## Krok 1: Dodaj pakiet `@medusajs/file`

W Medusa backend repo (lub Railway dashboard - Build settings):

### Opcja A: Jeśli masz dostęp do repo GitHub
```bash
cd medusa-backend
pnpm add @medusajs/file
git commit -am "feat: add S3 file provider for R2"
git push origin main
```

### Opcja B: Przez Railway dashboard (bez repo)
1. **Railway** → `Medusa Backend` service → **Settings** → **Environment**
2. Dodaj zmienną:
   ```
   NPM_INSTALL_COMMAND=pnpm add @medusajs/file && pnpm install
   ```
3. Redeploy

**Uwaga:** Railway template może mieć to już included - sprawdź `package.json`.

---

## Krok 2: Konfiguracja `medusa-config.ts`

W `medusa-config.ts` (plik konfiguracji Medusa):

```typescript
import { defineConfig } from "@medusajs/framework/utils";

export default defineConfig({
  // ... existing config

  modules: [
    {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_PUBLIC_URL, // Custom domain lub R2.dev URL
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION || "auto",
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT, // R2 endpoint
              // Opcjonalnie:
              // prefix: "products",
              // download_file_duration: 3600,
              // additional_client_config: {
              //   forcePathStyle: true,
              // },
            },
          },
        ],
      },
    },
    // ... other modules
  ],
});
```

**Uwaga:** Jeśli Railway template używa starej wersji Medusa (v1.x), składnia może się różnić:
```js
// medusa-config.js (v1.x)
module.exports = {
  plugins: [
    // ... existing plugins
    {
      resolve: `medusa-file-s3`,
      options: {
        s3_url: process.env.S3_PUBLIC_URL,
        bucket: process.env.S3_BUCKET,
        region: process.env.S3_REGION,
        access_key_id: process.env.S3_ACCESS_KEY_ID,
        secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
        endpoint: process.env.S3_ENDPOINT,
      },
    },
  ],
};
```

---

## Krok 3: Dodaj ENV w Railway

**Railway** → `Medusa Backend` service → **Variables**:

```bash
# Cloudflare R2 Configuration
S3_ENDPOINT=https://3bb182471d47af691bed886d658fb9c3.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=retrohouse-media

# Credentials (z Cloudflare R2 API Tokens)
S3_ACCESS_KEY_ID=<ACCESS_KEY_Z_CLOUDFLARE>
S3_SECRET_ACCESS_KEY=<SECRET_KEY_Z_CLOUDFLARE>

# Public URL (custom domain lub R2.dev)
# Opcja 1: Custom domain (zalecane, wymaga konfiguracji DNS)
S3_PUBLIC_URL=https://assets.sklep-retrohouse.pl

# Opcja 2: R2.dev subdomain (automatyczny, ale brzydki URL)
# S3_PUBLIC_URL=https://pub-<hash>.r2.dev
```

### Jak uzyskać R2.dev URL (bez custom domain):

```bash
# Lokalnie (Wrangler CLI)
wrangler r2 bucket domain add retrohouse-media
```

Lub w **Cloudflare Dashboard** → **R2** → `retrohouse-media` → **Settings** → **Public Access** → **Allow Access**.

---

## Krok 4: Redeploy Medusa Backend

```bash
# Railway CLI
railway service --name "Medusa Backend"
railway up --detach

# Lub: Railway dashboard → Medusa Backend → Deploy → Trigger Deploy
```

---

## Krok 5: Weryfikacja

1. **Zaloguj się do Medusa Admin** (https://medusa-backend-production-9270.up.railway.app/app)
2. **Dodaj produkt** → **Upload zdjęcia**
3. **Sprawdź URL zdjęcia** w inspektorze:
   - ✅ Powinno być: `https://assets.sklep-retrohouse.pl/products/...`
   - ❌ NIE: `https://medusa-backend-production-9270.up.railway.app/static/...`

4. **Sprawdź R2 bucket** (Wrangler CLI):
   ```bash
   wrangler r2 object list retrohouse-media
   ```

---

## Migracja istniejących zdjęć (opcjonalnie)

Jeśli masz stare zdjęcia na dysku Railway (przed migrację), możesz je przenieść:

```bash
# 1. Pobierz stare pliki z Railway
railway run --service "Medusa Backend" -- tar -czf /tmp/static.tar.gz /app/uploads

# 2. Wyciągnij lokalnie (Railway shell)
railway shell --service "Medusa Backend"
# W shell:
cd /app/uploads
ls -la  # sprawdź pliki

# 3. Upload do R2 (lokalnie z Wrangler)
wrangler r2 object put retrohouse-media/products/old-image.jpg --file ./old-image.jpg
```

**UWAGA:** Jeśli pliki już zniknęły (efemeryczy dysk), NIE DA SIĘ ich odzyskać. Trzeba re-uploadować przez Medusa Admin.

---

## Custom Domain dla R2 (zalecane)

**Zalety:**
- Krótkie URL (assets.sklep-retrohouse.pl zamiast pub-xxx.r2.dev)
- Pełna kontrola nad CDN
- Profesjonalny wygląd

**Konfiguracja:**

1. **Cloudflare Dashboard** → **R2** → `retrohouse-media` → **Settings** → **Custom Domains**
2. Kliknij **"Connect Domain"**
3. Wprowadź: `assets.sklep-retrohouse.pl`
4. Cloudflare automatycznie doda rekord CNAME w DNS (jeśli domena jest w Cloudflare DNS)
5. Czekaj 2–5 minut na propagację DNS
6. Zaktualizuj `S3_PUBLIC_URL` w Railway ENV
7. Redeploy Medusa Backend

**Weryfikacja:**
```bash
curl -I https://assets.sklep-retrohouse.pl/
# Oczekiwane: 403 Forbidden (bucket istnieje, ale brak public access listing)
```

---

## Troubleshooting

### Upload nie działa (403 Forbidden)
- Sprawdź `S3_ACCESS_KEY_ID` i `S3_SECRET_ACCESS_KEY` w Railway ENV
- Sprawdź permissions w Cloudflare R2 API Token (Object Read & Write)

### Zdjęcia nie ładują się na storefront (404)
- Sprawdź `S3_PUBLIC_URL` - czy domena jest poprawna?
- Sprawdź czy R2 bucket ma **Allow Public Access** (dla public reads)
- Lub: skonfiguruj custom domain z automatic public access

### Medusa loguje błąd: "Missing file provider"
- Sprawdź czy `@medusajs/file` jest w `package.json`
- Sprawdź logi Railway build: czy pakiet zainstalował się?

---

## Cost

- **R2 Storage:** ~$0.015/GB/miesiąc (10 GB free tier)
- **R2 Egress:** $0 (zawsze darmowy)
- **Railway:** bez zmian (storage był i tak efemeryczny)

**Szacowany koszt:** $0–1/mc dla małego sklepu.

---

## Następne kroki

1. ✅ Dodaj ENV do Railway
2. ✅ Zmodyfikuj `medusa-config.ts` (lub przez Railway template fork)
3. ✅ Redeploy
4. ✅ Upload testowego zdjęcia
5. ✅ Ustaw `NEXT_PUBLIC_MEDIA_CDN_URL` w storefront (Vercel)

Patrz: `docs/runbook/railway-disaster-recovery.md` dla pełnego disaster recovery planu.
