# Start backend + Expo (two processes)
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Starting backend in new window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location '$root'; npm run backend:dev"
)

Write-Host "Starting Expo..." -ForegroundColor Cyan
npx expo start
