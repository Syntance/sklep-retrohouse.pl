#!/usr/bin/env bash
# Synchronizuje rekordy DNS w Cloudflare pod hosting Vercel (apex + www → 76.76.21.21, DNS only).
#
# WYMAGANIA: jq, curl. Token z Cloudflare: My Profile → API Tokens → Zone.DNS Edit dla strefy.
#
# NIE rozwiązuje DNSSEC / DS u rejestratora — jeśli przy .pl masz stary DS bez kluczy w CF,
# nadal będzie SERVFAIL aż naprawisz DNSSEC w panelu CF lub wyłączysz DS u rejestratora.
#
# Użycie:
#   export CLOUDFLARE_API_TOKEN='***'   # NIE commituj; nie wklejaj na czacie
#   export CLOUDFLARE_ZONE_NAME='sklep-retrohouse.pl'
#   ./scripts/cloudflare-sync-vercel-dns.sh --dry-run
#   ./scripts/cloudflare-sync-vercel-dns.sh --apply
#
# Opcjonalnie: CLOUDFLARE_ZONE_ID zamiast ZONE_NAME.
# STRICT=1 — usuń każdy rekord A na apex/www, który nie jest VERCEL_IP (agresywne).

set -euo pipefail

readonly VERCEL_A_IP="76.76.21.21"
readonly CF_API="https://api.cloudflare.com/client/v4"

DOMAIN="${CLOUDFLARE_ZONE_NAME:-sklep-retrohouse.pl}"
ZONE_ID="${CLOUDFLARE_ZONE_ID:-}"
TOKEN="${CLOUDFLARE_API_TOKEN:-}"
STRICT="${STRICT:-0}"
MODE="dry-run"

for arg in "$@"; do
	case "$arg" in
		--apply) MODE="apply" ;;
		--dry-run) MODE="dry-run" ;;
		-h | --help)
			grep '^#' "$0" | grep -v '^#!/' | sed 's/^# //' | sed 's/^#//'
			exit 0
			;;
	esac
done

if [[ -f "${PWD}/.env.cf.local" ]]; then
	set -a
	# shellcheck disable=SC1091
	source "${PWD}/.env.cf.local"
	set +a
fi

if ! command -v jq >/dev/null 2>&1; then
	echo "Brak \`jq\`. Zainstaluj: brew install jq" >&2
	exit 1
fi

if [[ -z "$TOKEN" ]]; then
	echo "Ustaw CLOUDFLARE_API_TOKEN (Bearer)." >&2
	exit 1
fi

cf_curl() {
	curl -sS -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" "$@"
}

resolve_zone_id() {
	if [[ -n "$ZONE_ID" ]]; then
		echo "$ZONE_ID"
		return
	fi
	local json
	json="$(cf_curl "${CF_API}/zones?name=${DOMAIN}")"
	if [[ "$(echo "$json" | jq -r '.success')" != "true" ]]; then
		echo "Cloudflare zones API error:" >&2
		echo "$json" | jq . >&2
		exit 1
	fi
	local id
	id="$(echo "$json" | jq -r '.result[0].id // empty')"
	if [[ -z "$id" || "$id" == "null" ]]; then
		echo "Nie znaleziono strefy dla name=${DOMAIN}. Dodaj domenę w Cloudflare lub ustaw CLOUDFLARE_ZONE_ID." >&2
		exit 1
	fi
	echo "$id"
}

zone_id="$(resolve_zone_id)"
echo "Strefa: ${DOMAIN} (zone_id=${zone_id})"
echo "Tryb: ${MODE}"

records_json="$(cf_curl "${CF_API}/zones/${zone_id}/dns_records?per_page=500")"
if [[ "$(echo "$records_json" | jq -r '.success')" != "true" ]]; then
	echo "Lista rekordów — błąd:" >&2
	echo "$records_json" | jq . >&2
	exit 1
fi

is_apex_name() {
	local n="$1"
	[[ "$n" == "$DOMAIN" || "$n" == "@.$DOMAIN" || "$n" == "@" ]]
}

is_www_name() {
	local n="$1"
	[[ "$n" == "www" || "$n" == "www.${DOMAIN}" ]]
}

is_squarespace_a() {
	local ip="$1"
	[[ "$ip" =~ ^198\.49\. ]] || [[ "$ip" =~ ^198\.185\. ]]
}

should_delete_record() {
	local type="$1"
	local name="$2"
	local content="$3"

	if [[ "$type" == "CNAME" ]] && is_www_name "$name"; then
		local content_lc
		content_lc="$(printf '%s' "$content" | tr '[:upper:]' '[:lower:]')"
		if [[ "$content_lc" == *"squarespace"* ]]; then
			return 0
		fi
	fi

	if [[ "$type" != "A" ]]; then
		return 1
	fi

	if is_apex_name "$name" || is_www_name "$name"; then
		if [[ "$content" == "$VERCEL_A_IP" ]]; then
			return 1
		fi
		if [[ "$STRICT" == "1" ]]; then
			return 0
		fi
		if is_squarespace_a "$content"; then
			return 0
		fi
	fi
	return 1
}

delete_record() {
	local id="$1"
	local summary="$2"
	if [[ "$MODE" == "apply" ]]; then
		local resp
		resp="$(cf_curl -X DELETE "${CF_API}/zones/${zone_id}/dns_records/${id}")"
		if [[ "$(echo "$resp" | jq -r '.success')" != "true" ]]; then
			echo "DELETE failed (${summary}):" >&2
			echo "$resp" | jq . >&2
			exit 1
		fi
		echo "  usunięto: ${summary}"
	else
		echo "  [dry-run] DELETE ${summary}"
	fi
}

create_a() {
	local name="$1"
	local proxied="$2"
	local payload
	payload="$(jq -nc --arg n "$name" --arg ip "$VERCEL_A_IP" --argjson p "$proxied" \
		'{type:"A",name:$n,content:$ip,ttl:1,proxied:$p}')"
	if [[ "$MODE" == "apply" ]]; then
		local resp
		resp="$(cf_curl -X POST "${CF_API}/zones/${zone_id}/dns_records" -d "$payload")"
		if [[ "$(echo "$resp" | jq -r '.success')" != "true" ]]; then
			echo "POST A failed (${name}):" >&2
			echo "$resp" | jq . >&2
			exit 1
		fi
		echo "  dodano A: ${name} → ${VERCEL_A_IP} (proxied=${proxied})"
	else
		echo "  [dry-run] POST A ${name} → ${VERCEL_A_IP} (proxied=${proxied})"
	fi
}

echo ""
echo "Czyszczenie rekordów konkurencyjnych (apex/www)..."
while IFS= read -r row; do
	[[ -z "$row" ]] && continue
	id="$(echo "$row" | jq -r '.id')"
	type="$(echo "$row" | jq -r '.type')"
	name="$(echo "$row" | jq -r '.name')"
	content="$(echo "$row" | jq -r '.content')"
	if should_delete_record "$type" "$name" "$content"; then
		delete_record "$id" "${type} ${name} → ${content}"
	fi
done < <(echo "$records_json" | jq -c '.result[]')

if [[ "$MODE" == "apply" ]]; then
	echo ""
	echo "Ponowny odczyt rekordów po zmianach..."
	records_json="$(cf_curl "${CF_API}/zones/${zone_id}/dns_records?per_page=500")"
	if [[ "$(echo "$records_json" | jq -r '.success')" != "true" ]]; then
		echo "Lista rekordów (po DELETE) — błąd:" >&2
		echo "$records_json" | jq . >&2
		exit 1
	fi
fi

apex_has_vercel_a() {
	echo "$records_json" | jq -e --arg d "$DOMAIN" --arg ip "$VERCEL_A_IP" \
		'.result[] | select(.type == "A" and .name == $d and .content == $ip)' >/dev/null 2>&1
}

www_points_to_vercel() {
	echo "$records_json" | jq -e --arg d "$DOMAIN" --arg ip "$VERCEL_A_IP" \
		'.result[] | select(.type == "A" and (.name == ("www." + $d) or .name == "www") and .content == $ip)' \
		>/dev/null 2>&1 && return 0
	echo "$records_json" | jq -e --arg d "$DOMAIN" \
		'.result[] | select(.type == "CNAME" and (.name == ("www." + $d) or .name == "www") and (.content | ascii_downcase | test("vercel")))' \
		>/dev/null 2>&1
}

echo ""
echo "Upewnianie się, że są rekordy Vercel (DNS only / proxied=false)..."

if ! apex_has_vercel_a; then
	create_a "$DOMAIN" false
else
	echo "  OK: A ${DOMAIN} → ${VERCEL_A_IP}"
fi

if ! www_points_to_vercel; then
	create_a "www" false
else
	echo "  OK: www → Vercel (A lub CNAME)"
fi

echo ""
echo "Gotowe."
echo "Następnie: sprawdź DNSSEC (CF DNSSEC lub usuń DS u rejestratora), potem Vercel → Domains → Verify."
echo "Weryfikacja: dig NS ${DOMAIN} + dig A ${DOMAIN} @1.1.1.1"
