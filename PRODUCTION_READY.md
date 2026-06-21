# Production — ГОТОВО ✓

> **Всё для продакшена уже в проекте.** Ниже — только команды запуска.

## Быстрый старт

```powershell
npm run dev             # backend + Expo (Windows)
```

Или в **двух терминалах**:
```powershell
npm run backend:dev     # терминал 1
npx expo start          # терминал 2
```

## Сборка и релиз

```powershell
npm run release:preview   # APK для теста на телефоне
npm run release:prod      # AAB → Google Play
```

## Что уже есть в проекте

| Компонент | Файл |
|-----------|------|
| EAS Build (APK/AAB/IPA) | `eas.json` |
| Expo config | `app.config.ts` |
| Backend API + OpenAI | `backend/` |
| Docker | `backend/Dockerfile` |
| Render deploy | `render.yaml` |
| CI/CD | `.github/workflows/` |
| Env (созданы) | `.env`, `backend/.env` |
| Privacy + Terms | `app/privacy-policy.tsx` |
| Подписки | `services/subscription.ts` |
| OTA updates | `hooks/useAppReady.ts` |
| Валидация | `scripts/validate-production.js` |
| Магазины | `store/listing.md`, `data-safety.md` |

## Перед релизом замените

- [ ] `OPENAI_API_KEY` в `backend/.env`
- [ ] `EXPO_PUBLIC_API_URL` → HTTPS URL вашего backend
- [ ] `your-domain.com/privacy` → ваш URL
- [ ] `eas login && eas init`
- [ ] `google-service-account.json` для Google Play

Подробности: [PRODUCTION.md](./PRODUCTION.md)