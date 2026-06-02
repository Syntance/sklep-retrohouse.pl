# Konfiguracja Railway Cron dla backup bazy do R2

## Krok 1: Dodaj Railway Cron Service

1. **Railway dashboard** → projekt `sklep-retrohouse-pl-medusa`
2. **+ New** → **Empty Service**
3. Nazwa: `Database Backup Cron`
4. **Settings** → **Cron Schedule**:
   ```
   0 3 * * *
   ```
   (codziennie o 03:00 UTC)

## Krok 2: Deploy skryptu backup

### Opcja A: Z repo GitHub (zalecane)

1. Utwórz repo `sklep-retrohouse-infrastructure` z plikiem:
   ```
   /
   ├── backup-medusa-db.sh     (skopiuj z tego workspace)
   ├── Dockerfile
   └── railway.toml
   ```

2. **Dockerfile**:
   ```dockerfile
   FROM postgres:16-alpine
   RUN apk add --no-cache bash aws-cli gzip
   WORKDIR /app
   COPY backup-medusa-db.sh .
   RUN chmod +x backup-medusa-db.sh
   CMD ["./backup-medusa-db.sh"]
   ```

3. **railway.toml**:
   ```toml
   [build]
   builder = "dockerfile"
   
   [deploy]
   startCommand = "./backup-medusa-db.sh"
   ```

4. Railway Cron Service → **Deploy from GitHub** → wybierz repo

### Opcja B: Inline Dockerfile (dla testu)

1. Railway Cron Service → **Settings** → **Source**
2. Wklej Dockerfile jak wyżej + skrypt inline
3. Deploy

## Krok 3: ENV dla Cron Service

W **Railway Cron Service → Variables** dodaj:

```bash
# Database (reference z Postgres service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# R2 credentials (te same co Medusa Backend)
R2_BUCKET=retrohouse-backups
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
AWS_ACCESS_KEY_ID=your_r2_access_key
AWS_SECRET_ACCESS_KEY=your_r2_secret_key
AWS_DEFAULT_REGION=auto

# Opcjonalne
BACKUP_PREFIX=db/daily
RETENTION_DAYS=30
```

**WAŻNE:** Użyj **shared variables** lub **reference syntax** `${{SERVICE.VAR}}` aby nie duplikować credentials.

## Krok 4: Testowanie

```bash
# Ręczne uruchomienie (Railway CLI)
railway run --service "Database Backup Cron"

# Sprawdź logs
railway logs --service "Database Backup Cron"
```

## Krok 5: Weryfikacja w R2

```bash
# Lokalnie (wrangler + .env.cf.local)
wrangler r2 object list retrohouse-backups --prefix db/daily/

# Lub: aws CLI
aws s3 ls s3://retrohouse-backups/db/daily/ --endpoint-url https://...
```

---

## Harmonogram

| Czas (UTC) | Akcja |
|------------|-------|
| 03:00 | Daily backup → R2 |
| 03:05 | Retention cleanup (usuń > 30 dni) |

**Cost:** Railway Cron = ~$2–5/mc (run time w minutach).
