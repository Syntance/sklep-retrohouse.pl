# Kopiuje S3/R2 env z Railway (Medusa Backend) do Vercel (sklep-retrohouse-pl).
# Wymaga: railway zalogowany na konto Retrohouse + vercel zalogowany na syntance.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "==> Railway whoami" -ForegroundColor Cyan
railway whoami

$service = Read-Host "Nazwa serwisu Railway z Medusą (np. Medusa Backend)"
if (-not $service.Trim()) { throw "Podaj nazwę serwisu." }

railway link --service $service

$vars = @(
	"S3_ENDPOINT",
	"S3_BUCKET",
	"S3_ACCESS_KEY_ID",
	"S3_SECRET_ACCESS_KEY",
	"S3_PUBLIC_URL",
	"S3_REGION"
)

foreach ($name in $vars) {
	$value = (railway variables get $name 2>$null)
	if (-not $value) {
		Write-Warning "Brak $name w Railway — pomijam."
		continue
	}
	Write-Host "==> vercel env add $name (production, preview, development)" -ForegroundColor Green
	$value | vercel env add $name production preview development --force
}

Write-Host "`nGotowe. Uruchom redeploy na Vercel." -ForegroundColor Green
