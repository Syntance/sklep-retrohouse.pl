#!/usr/bin/env bash
# Backup bazy Medusa (PostgreSQL) → Cloudflare R2 (S3-compatible), z retencją.
# Patrz: docs/runbook/railway-disaster-recovery.md
#
# WYMAGANIA: pg_dump (klient PostgreSQL), aws CLI (do R2 przez endpoint), gzip.
#
# ENV (NIE commituj — Railway Cron Service / GitHub Actions secrets):
#   DATABASE_URL              postgres://user:pass@host:5432/db   (źródło)
#   R2_BUCKET                 retrohouse-backups
#   R2_ENDPOINT               https://<ACCOUNT_ID>.r2.cloudflarestorage.com
#   AWS_ACCESS_KEY_ID         klucz R2 (Object Read & Write)
#   AWS_SECRET_ACCESS_KEY     sekret R2
#   AWS_DEFAULT_REGION        auto
# Opcjonalnie:
#   BACKUP_PREFIX             db/daily         (domyślnie: db/daily)
#   RETENTION_DAYS            30               (0 = nie usuwaj starych)
#
# Użycie:
#   ./scripts/backup-medusa-db.sh
#
# Harmonogram (cron): 0 3 * * *  — codziennie 03:00.

set -euo pipefail

DATABASE_URL="${DATABASE_URL:-}"
R2_BUCKET="${R2_BUCKET:-}"
R2_ENDPOINT="${R2_ENDPOINT:-}"
BACKUP_PREFIX="${BACKUP_PREFIX:-db/daily}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

fail() {
	echo "ERROR: $1" >&2
	exit 1
}

[ -n "$DATABASE_URL" ] || fail "Brak DATABASE_URL."
[ -n "$R2_BUCKET" ] || fail "Brak R2_BUCKET."
[ -n "$R2_ENDPOINT" ] || fail "Brak R2_ENDPOINT."
command -v pg_dump >/dev/null 2>&1 || fail "Brak pg_dump (zainstaluj klienta PostgreSQL)."
command -v aws >/dev/null 2>&1 || fail "Brak aws CLI."
command -v gzip >/dev/null 2>&1 || fail "Brak gzip."

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILENAME="medusa-${TIMESTAMP}.sql.gz"
TMP_DIR="$(mktemp -d)"
LOCAL_PATH="${TMP_DIR}/${FILENAME}"
S3_URI="s3://${R2_BUCKET}/${BACKUP_PREFIX}/${FILENAME}"

cleanup() {
	rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo "==> Zrzut bazy (pg_dump) → ${FILENAME}"
# --no-owner / --no-privileges: restore na inny serwis bez kolizji ról.
pg_dump "$DATABASE_URL" --no-owner --no-privileges --format=plain \
	| gzip -9 >"$LOCAL_PATH"

SIZE="$(wc -c <"$LOCAL_PATH" | tr -d ' ')"
[ "$SIZE" -gt 0 ] || fail "Pusty zrzut — przerwano przed wysyłką."
echo "    rozmiar: ${SIZE} B"

echo "==> Wysyłka do R2: ${S3_URI}"
aws s3 cp "$LOCAL_PATH" "$S3_URI" \
	--endpoint-url "$R2_ENDPOINT" \
	--only-show-errors

echo "    OK"

if [ "$RETENTION_DAYS" -gt 0 ]; then
	echo "==> Retencja: usuwam zrzuty starsze niż ${RETENTION_DAYS} dni"
	CUTOFF_EPOCH=$(( $(date -u +%s) - RETENTION_DAYS * 86400 ))
	aws s3 ls "s3://${R2_BUCKET}/${BACKUP_PREFIX}/" --endpoint-url "$R2_ENDPOINT" \
		| awk '{print $4}' | grep -E '^medusa-.*\.sql\.gz$' || true \
		| while read -r key; do
			# medusa-YYYYMMDDTHHMMSSZ.sql.gz → wytnij znacznik czasu
			ts="${key#medusa-}"
			ts="${ts%.sql.gz}"
			file_epoch="$(date -u -d "${ts:0:8} ${ts:9:2}:${ts:11:2}:${ts:13:2}" +%s 2>/dev/null || echo 0)"
			if [ "$file_epoch" -gt 0 ] && [ "$file_epoch" -lt "$CUTOFF_EPOCH" ]; then
				echo "    usuwam ${key}"
				aws s3 rm "s3://${R2_BUCKET}/${BACKUP_PREFIX}/${key}" \
					--endpoint-url "$R2_ENDPOINT" --only-show-errors
			fi
		done
fi

echo "==> Gotowe: ${S3_URI}"
