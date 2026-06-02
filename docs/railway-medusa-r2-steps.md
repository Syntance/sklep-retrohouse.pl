# Railway Medusa Backend - Konfiguracja R2 (krok po kroku)

**Status:** ENV variables już dodane ✅  
**Brakuje:** Kod konfiguracji Medusa + package dependency

---

## ⚠️ WAŻNE: Railway Template

Twój Medusa Backend jest wdrożony z **Railway Template**, nie z własnego repo GitHub.  
To oznacza że **nie możesz bezpośrednio edytować kodu** przez Git.

### Opcje:

#### Opcja A: Fork template do własnego repo (zalecane, 10 min)
✅ Pełna kontrola nad kodem  
✅ Git workflow (branches, PR, rollback)  
✅ Łatwe dodanie @medusajs/file

#### Opcja B: Modyfikacja przez Railway dashboard (szybkie, 2 min)
❌ Ograniczone możliwości  
⚠️ Trudniejszy rollback  
✅ Działa jeśli template już ma @medusajs/file

---

## Sprawdzenie: Czy @medusajs/file już jest?

1. **Railway dashboard** → `Medusa Backend` → **Deployments** (tab)
2. Kliknij najnowszy deployment → **View Logs**
3. Znajdź log buildu: poszukaj `@medusajs/file` w package install
4. **Jeśli NIE MA** → wybierz Opcję A lub C poniżej

---

## Opcja A: Fork template do własnego repo

### 1. Znajdź źródło template
Railway template Medusa v2 pochodzi z: `https://github.com/medusajs/medusa-starter-default`

### 2. Fork repo
```bash
# W Twoim GitHub
1. Idź na https://github.com/medusajs/medusa-starter-default
2. Kliknij "Fork"
3. Nazwa: sklep-retrohouse-medusa-backend
```

### 3. Clone lokalnie i modyfikuj
```bash
git clone https://github.com/YOUR_USERNAME/sklep-retrohouse-medusa-backend
cd sklep-retrohouse-medusa-backend

# Dodaj @medusajs/file
pnpm add @medusajs/file

# Edytuj medusa-config.ts
# (patrz sekcja "Konfiguracja medusa-config.ts" poniżej)

git add .
git commit -m "feat: add Cloudflare R2 file storage"
git push origin main
```

### 4. Zmień źródło deployu w Railway
1. **Railway dashboard** → `Medusa Backend` → **Settings** → **Source**
2. Kliknij **"Disconnect"** (odłącz template)
3. Kliknij **"Connect Repository"**
4. Wybierz: `YOUR_USERNAME/sklep-retrohouse-medusa-backend`
5. Branch: `main`
6. **Deploy** (automatyczny)

---

## Opcja B: Dodaj package przez Railway ENV (hack)

⚠️ Działa TYLKO jeśli Railway template już ma `medusa-config.ts` gotowy na S3.

### 1. Dodaj build command override
**Railway dashboard** → `Medusa Backend` → **Settings** → **Build Command**:
```bash
pnpm add @medusajs/file && pnpm build
```

### 2. Redeploy
**Deployments** tab → **Trigger Deploy** → **Deploy**

### 3. Sprawdź logi
Poszukaj w logach buildu:
```
+ @medusajs/file 2.x.x
```

⚠️ **To NIE zadziała jeśli `medusa-config.ts` nie jest skonfigurowany dla S3!**

---

## Opcja C: Testuj proxy (bez modyfikacji kodu)

Medusa może serwować pliki z R2 **przez własny backend** (proxy).  
ENV `S3_PUBLIC_URL` ustawiony na `https://medusa-backend-production-9270.up.railway.app/static`.

### Weryfikacja:
1. Zaloguj się do **Medusa Admin**: https://medusa-backend-production-9270.up.railway.app/app
2. Dodaj produkt → Upload zdjęcie
3. Sprawdź URL zdjęcia w preview:
   - ✅ Jeśli zawiera `/static/` = działa proxy
   - ❌ Jeśli błąd 500/404 = brak file provider w kodzie

⚠️ **Wada:** Zdjęcia serwowane przez Railway (nie CDN R2), wolniejsze.

---

## Konfiguracja medusa-config.ts (dla Opcji A)

Edytuj `medusa-config.ts` lub `medusa-config.js`:

```typescript
import { defineConfig } from "@medusajs/framework/utils";

export default defineConfig({
  projectConfig: {
    // ... existing config
  },
  
  modules: [
    {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_PUBLIC_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION,
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
              additional_client_config: {
                forcePathStyle: true, // WAŻNE dla R2
              },
            },
          },
        ],
      },
    },
    // ... other modules
  ],
});
```

**Dla Medusa v1.x (starsza wersja):**
```js
// medusa-config.js
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

## Redeploy Medusa Backend (Railway)

### Automatyczny (po zmianie repo):
Railway wykryje nowy commit w GitHub → auto-deploy

### Ręczny (przez CLI):
```bash
# Lokalnie
railway link
railway service --name "Medusa Backend"
railway up --detach
```

### Ręczny (przez dashboard):
1. **Railway dashboard** → `Medusa Backend` → **Deployments**
2. Kliknij **"Trigger Deploy"** → **"Deploy"**

---

## Weryfikacja

### 1. Sprawdź deployment logs
```
✓ @medusajs/file installed
✓ Build succeeded
✓ Service started on port 9000
```

### 2. Test upload w Medusa Admin
1. https://medusa-backend-production-9270.up.railway.app/app
2. Products → Add Product → Upload Image
3. Sprawdź URL zdjęcia:
   - ✅ `https://assets.sklep-retrohouse.pl/...` (R2 custom domain)
   - ✅ `https://pub-xxxxx.r2.dev/...` (R2.dev)
   - ⚠️ `https://medusa-backend.../static/...` (proxy, działa ale wolne)

### 3. Sprawdź R2 bucket
```bash
# Lokalnie (Wrangler CLI)
wrangler r2 object list retrohouse-media
```

Powinieneś zobaczyć uploadowane pliki.

---

## Troubleshooting

### "Module @medusajs/file not found"
→ Package nie zainstalował się. Sprawdź build logs i `package.json`.

### "Failed to upload file to S3"
→ Sprawdź `S3_ACCESS_KEY_ID` i `S3_SECRET_ACCESS_KEY` w Railway ENV.

### Zdjęcia nie ładują się (404 na storefront)
→ Sprawdź `S3_PUBLIC_URL` i czy R2 bucket ma public access lub custom domain.

---

## Zalecenia

✅ **Opcja A (fork repo)** – najlepsza dla długoterminowej kontroli  
⚠️ **Opcja C (proxy)** – szybki test, ale nie CDN  
❌ **Opcja B (build command hack)** – ryzykowne, może nie działać

**Po wyborze opcji:** napisz tutaj którą wybrałeś, pomogę dokończyć konfigurację.
