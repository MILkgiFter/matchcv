# Store payments (RevenueCat + Google Play)

Package name (must match everywhere): **`com.matchcv.app`**

Product IDs in code (`services/subscription.ts` → `PLANS.productId`):

| Plan in app | Store product ID | Type |
|-------------|------------------|------|
| monthly     | `monthly`        | Subscription P1M |
| annual      | `yearly`         | Subscription P1Y |
| lifetime    | `lifetime`       | One-time |

These must match **Google Play Console** and **RevenueCat store_identifier** exactly (case-sensitive).

---

## Step 1 — Google Play Console

1. Create app (if not done): package `com.matchcv.app`.
2. **Monetize → Products → Subscriptions** — create:
   - Product ID: `monthly` → add base plan (e.g. base plan ID `monthly`, billing period 1 month, price $4.99).
   - Product ID: `yearly` → base plan ID `yearly`, period 1 year, price $29.99.
3. **Monetize → Products → In-app products** — create:
   - Product ID: `lifetime`, one-time, price $49.99.
4. Activate all products (draft → active).

**Google Play subscription identifier format:** `product_id:base_plan_id`  
Example: if product is `monthly` and base plan is `monthly`, the full ID is `monthly:monthly`.  
In RevenueCat, set **store_identifier** to that full string for subscriptions.  
For **lifetime** (one-time), use only `lifetime`.

---

## Step 2 — RevenueCat project

1. **Project Settings → Apps → Add app → Google Play**
   - Package name: `com.matchcv.app`
   - Upload **Service Account JSON** from Google Cloud (Play Console → API access → link service account with “View financial data” + “Manage orders”).
2. Copy the **Android public API key** (starts with `goog_…`) — not the Test Store key.
3. **Products** — for the **Google Play app** (not Test Store), create/link:
   - `monthly` → store identifier `monthly:monthly` (adjust if your base plan ID differs)
   - `yearly` → store identifier `yearly:yearly`
   - `lifetime` → store identifier `lifetime`
4. **Entitlements** — e.g. entitlement `premium` attached to all three products.
5. **Offerings** — default offering with packages `$rc_monthly`, `$rc_annual`, `$rc_lifetime` (or custom identifiers mapped in code).

---

## Step 3 — App env

```env
# Android (from RevenueCat → Google Play app, NOT Test Store)
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=goog_xxxxxxxx

# iOS later
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_xxxxxxxx
```

Install SDK:

```bash
npx expo install react-native-purchases
```

Implement purchase/restore in `services/subscription.ts` (native build required — Expo Go will not work for real IAP).

---

## Checklist before testing on device

- [ ] Play Console app exists with package `com.matchcv.app`
- [ ] Products `monthly`, `yearly`, `lifetime` active in Play Console
- [ ] Google Play app added in RevenueCat (not only Test Store)
- [ ] Service account linked
- [ ] store_identifier matches Play Console (`product:base_plan` for subs)
- [ ] `.env` uses Android API key from Google Play app
- [ ] EAS preview/production APK installed (not web, not Expo Go)

Test with a **license tester** account in Play Console.
