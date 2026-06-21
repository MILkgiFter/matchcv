@echo off
cd /d "%~dp0.."
echo Installing dependencies...
call npm install
call npm run backend:install
if not exist .env copy .env.example .env
if not exist backend\.env copy backend\.env.example backend\.env
echo Generating icons...
call node scripts\generate-icons.js
echo.
echo Done! Edit .env files, then run:
echo   npm run backend:dev
echo   npx expo start
pause
