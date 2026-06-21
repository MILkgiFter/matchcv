# Release script — MatchCV
# Usage:
#   .\scripts\release.ps1 -Target preview    # APK for testing
#   .\scripts\release.ps1 -Target production # AAB for Google Play

param(
    [ValidateSet('preview', 'production')]
    [string]$Target = 'preview',
    [ValidateSet('android', 'ios', 'all')]
    [string]$Platform = 'android'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "`n=== MatchCV — Release [$Target / $Platform] ===`n" -ForegroundColor Cyan

# 1. Validate
Write-Host "[1/4] Validating config..." -ForegroundColor Yellow
node scripts/validate-production.js --profile $Target
if ($LASTEXITCODE -ne 0) { exit 1 }

# 2. Typecheck
Write-Host "[2/4] Typecheck..." -ForegroundColor Yellow
npm run typecheck
npm run typecheck --prefix backend

# 3. Check EAS CLI
if (-not (Get-Command eas -ErrorAction SilentlyContinue)) {
    Write-Host "EAS CLI not found. Install: npm install -g eas-cli" -ForegroundColor Red
    exit 1
}

# 4. Build
Write-Host "[3/4] Starting EAS build..." -ForegroundColor Yellow
$profile = $Target
if ($Platform -eq 'all') {
    eas build --platform all --profile $profile
} else {
    eas build --platform $Platform --profile $profile
}

if ($LASTEXITCODE -ne 0) { exit 1 }

# 5. Submit (production only)
if ($Target -eq 'production') {
    Write-Host "[4/4] Submit to store? (y/n): " -ForegroundColor Yellow -NoNewline
    $answer = Read-Host
    if ($answer -eq 'y') {
        eas submit --platform $Platform --profile production
    }
} else {
    Write-Host "[4/4] Preview build done. Install APK from EAS dashboard." -ForegroundColor Green
}

Write-Host "`nDone!`n" -ForegroundColor Green
