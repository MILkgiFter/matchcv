# Production setup (Windows PowerShell)
# Run: .\scripts\setup-production.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "==> Installing mobile dependencies..." -ForegroundColor Cyan
Set-Location $root
npm install

Write-Host "==> Installing backend dependencies..." -ForegroundColor Cyan
npm run backend:install

if (-not (Test-Path "$root\.env")) {
  Copy-Item "$root\.env.example" "$root\.env"
  Write-Host "Created .env from .env.example" -ForegroundColor Yellow
}

if (-not (Test-Path "$root\backend\.env")) {
  Copy-Item "$root\backend\.env.example" "$root\backend\.env"
  Write-Host "Created backend/.env from .env.example" -ForegroundColor Yellow
}

Write-Host "==> Generating app icons..." -ForegroundColor Cyan
node "$root\scripts\generate-icons.js"

Write-Host "==> Typecheck..." -ForegroundColor Cyan
npm run typecheck
npm run typecheck --prefix backend

Write-Host ""
Write-Host "Done! Next steps:" -ForegroundColor Green
Write-Host "  1. Edit .env and backend/.env with your API keys"
Write-Host "  2. npm run backend:dev"
Write-Host "  3. npx expo start"
Write-Host "  4. eas login && eas init && npm run build:preview"
