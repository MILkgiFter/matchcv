# MatchCV

MatchCV — мобильное приложение для поиска работы: анализ резюме, match с вакансиями, генерация cover letter и AI-коуч.

## Продакшен

**Всё готово** — см. [PRODUCTION_READY.md](./PRODUCTION_READY.md)

```powershell
npm run setup
npm run validate:preview
npm run build:preview   # APK
```

## Быстрый старт

```bash
npm install
cp .env.example .env
npx expo start
```

## Продакшен

Полная инструкция: [PRODUCTION.md](./PRODUCTION.md)

```bash
# Backend
npm run backend:install
cd backend && cp .env.example .env && npm run dev

# Сборка APK
npm install -g eas-cli
eas login && eas init
npm run build:preview
```

## Архитектура

```
app/           — экраны (Expo Router)
services/      — API-клиент (resume, chat, cover letter)
backend/       — Node.js API + OpenAI
config/        — env-конфигурация
context/       — глобальное состояние
eas.json       — профили сборки EAS
app.config.ts  — конфиг Expo для prod
```

## Экраны

Onboarding, Home, Upload Resume, Analysis, Match Job, Cover Letter, AI Chat, Premium, Jobs, Profile

## Стек

- React Native + Expo SDK 52
- EAS Build & Updates
- Node.js + Express + OpenAI (backend)
- expo-document-picker, expo-secure-store
