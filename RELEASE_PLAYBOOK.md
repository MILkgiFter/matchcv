# MatchCV — полный релиз в Google Play

Пошаговый план. Автоматизируемое — через `npm run release:setup`.

---

## Шаг 0 — один раз настроить окружение

### 0a. GitHub (если репо ещё нет)

```powershell
cd C:\Users\NITRO\Downloads\aicvupgrade
git init
git add .
git commit -m "MatchCV initial release setup"
# Создай пустой репо на github.com, затем:
git remote add origin https://github.com/ТВОЙ_USERNAME/matchcv.git
git branch -M main
git push -u origin main
```

### 0b. Мастер настройки

```powershell
npm run release:setup
```

Скрипт спросит:
- URL backend на Render (пока можно placeholder, потом обновить)
- GitHub username
- Expo username
- RevenueCat key `goog_...` (можно позже)

Создаст `.env`, `backend/.env`, `RELEASE_STATUS.md`.

---

## Шаг 1 — Backend на Render

1. Залей репозиторий на **GitHub** (если ещё нет).
2. [Render Dashboard](https://dashboard.render.com) → **New → Blueprint**.
3. Выбери репо — подхватится `render.yaml` (папка `backend/`, health `/health`).
4. В Render задай **секреты** (Environment):
   - `API_KEY` — тот же, что в `.env` (`EXPO_PUBLIC_API_KEY`)
   - `GROQ_API_KEY` — с [console.groq.com](https://console.groq.com/keys)
5. После деплоя скопируй URL, например `https://matchcv-api.onrender.com`.
6. Обнови `.env`:
   ```env
   EXPO_PUBLIC_API_URL=https://matchcv-api.onrender.com
   ```
7. Проверка: `curl https://matchcv-api.onrender.com/health`

---

## Шаг 2 — Privacy policy (GitHub Pages)

1. GitHub → репо → **Settings → Pages → Build and deployment → GitHub Actions**.
2. Push в `main` — workflow `.github/workflows/pages.yml` публикует папку `docs/`.
3. URL: `https://ТВОЙ_USERNAME.github.io/matchcv/privacy.html`
4. Обнови в `.env`:
   ```env
   EXPO_PUBLIC_PRIVACY_URL=https://ТВОЙ_USERNAME.github.io/matchcv/privacy.html
   EXPO_PUBLIC_TERMS_URL=https://ТВОЙ_USERNAME.github.io/matchcv/terms.html
   ```

---

## Шаг 3 — EAS Build (APK для теста)

```powershell
npm install -g eas-cli
eas login
eas init                    # запишет EAS_PROJECT_ID в .env
npm run validate:preview
npm run build:preview       # APK ~15–25 мин
```

Скачай APK из [expo.dev](https://expo.dev) → установи на телефон.

> **Важно:** в `.env` должен быть **HTTPS** URL Render, не `localhost`.

---

## Шаг 4 — Google Play Console

1. [Play Console](https://play.google.com/console) → создай приложение.
2. Package name: **`com.matchcv.app`** (как в `app.config.ts`).
3. **Monetize → Subscriptions:** `monthly`, `yearly`.
4. **In-app products:** `lifetime`.
5. **Setup → License testing** — добавь свой Google-аккаунт для тестов.

Подробно: [store/payments.md](./store/payments.md)

---

## Шаг 5 — RevenueCat

1. [RevenueCat](https://app.revenuecat.com) → проект → **Add app → Google Play**.
2. Package: `com.matchcv.app`, загрузи **Service Account JSON** из Play Console.
3. Products + entitlement **`premium`** (см. `store/payments.md`).
4. Скопируй **Android public API key** (`goog_...`).
5. В `.env`:
   ```env
   EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=goog_xxxxxxxx
   ```
6. Пересобери APK: `npm run build:preview`.

SDK уже в проекте (`react-native-purchases`, `services/subscription.ts`).

---

## Шаг 6 — Production AAB в магазин

```powershell
npm run validate:prod
npm run release:prod          # AAB для Google Play
```

Submit (нужен `google-service-account.json`):

```powershell
eas submit --platform android --profile production
```

Или загрузи AAB вручную в Play Console → **Internal testing**.

---

## Чеклист перед публикацией

- [ ] Backend на Render, `/health` → `ai.configured: true`
- [ ] Privacy + Terms на GitHub Pages, URL в `.env`
- [ ] `API_KEY` совпадает в mobile `.env` и Render
- [ ] EAS project создан (`eas init`)
- [ ] APK протестирован на телефоне (анализ резюме работает)
- [ ] Play Console: продукты активны
- [ ] RevenueCat: entitlement `premium`, ключ в `.env`
- [ ] Store listing: [store/listing.md](./store/listing.md)
- [ ] Data safety: [store/data-safety.md](./store/data-safety.md)

---

## Полезные команды

| Команда | Назначение |
|---------|------------|
| `npm run release:setup` | Мастер настройки prod `.env` |
| `npm run validate:preview` | Проверка перед APK |
| `npm run validate:prod` | Проверка перед AAB |
| `npm run build:preview` | APK |
| `npm run build:android` | AAB |
| `npm run release:prod` | Полный prod pipeline |
