# Production Deployment

> **Краткий обзор:** см. [PRODUCTION_READY.md](./PRODUCTION_READY.md)

## 0. One-command setup (Windows)

```powershell
npm run setup
```

Creates `.env` files, installs deps, generates icons, runs typecheck.

## 1. Environment

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

| Variable | Where | Purpose |
|----------|-------|---------|
| `EXPO_PUBLIC_API_URL` | mobile `.env` | Backend URL (HTTPS in prod) |
| `EXPO_PUBLIC_API_KEY` | mobile `.env` | API auth key |
| `EXPO_PUBLIC_PRIVACY_URL` | mobile `.env` | Privacy policy URL for stores |
| `EXPO_PUBLIC_REVENUECAT_API_KEY` | mobile `.env` | In-app purchases (see `store/payments.md`) |
| `EAS_PROJECT_ID` | mobile `.env` | EAS project ID |
| `OPENAI_API_KEY` | backend `.env` | OpenAI (server only!) |
| `API_KEY` | backend `.env` | Must match `EXPO_PUBLIC_API_KEY` |

## 2. Backend deployment

### Local
```bash
npm run backend:install
cd backend && cp .env.example .env && npm run dev
```

### Docker
```bash
cd backend && cp .env.example .env
npm run docker:up
```

### Render (one-click)
Push repo and connect `render.yaml` in Render dashboard.

## 3. Mobile builds (EAS)

```bash
npm install -g eas-cli
eas login
eas init          # creates EAS_PROJECT_ID
```

| Command | Result |
|---------|--------|
| `npm run build:preview` | APK for testing |
| `npm run build:android` | AAB for Google Play |
| `npm run build:ios` | IPA for App Store |
| `npm run update` | OTA update (no store review) |
| `npm run validate:prod` | Check config before release build |

## 4. Store submission

1. Fill in `store/listing.md` with your texts
2. Add real icons to `assets/` (1024×1024 icon, splash)
3. Update `bundleIdentifier` / `package` in `app.config.ts`
4. Set privacy policy URL in `.env` and `eas.json`
5. Submit:
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

## 5. CI/CD

GitHub Actions runs on push to `main`:
- Mobile TypeScript check
- Backend build + typecheck

## 6. Pre-release checklist

- [ ] Backend deployed with HTTPS
- [ ] `API_KEY` matches on server and mobile
- [ ] `OPENAI_API_KEY` set on server
- [ ] Privacy Policy screen + public URL
- [ ] Terms of Service screen
- [ ] Real app icons (not placeholders)
- [ ] Test PDF upload on physical device
- [ ] `google-service-account.json` for Play Store submit
- [ ] Apple Developer account for iOS
