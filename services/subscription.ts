import i18n from '@/i18n';
import { env, getRevenueCatApiKey } from '@/config/env';
import { setPremiumStatus } from '@/services/storage';
import { Platform } from 'react-native';

export type PlanId = 'monthly' | 'annual' | 'lifetime';

export type Plan = {
  price: string;
  period: string;
  productId: string;
  badge?: string;
  savings?: string;
  perMonth?: string;
};

export const PLANS: Record<PlanId, Plan> = {
  annual: {
    price: '$29.99',
    period: '/ year',
    perMonth: '$2.50/mo',
    savings: 'Save 50%',
    badge: 'BEST VALUE',
    productId: 'yearly',
  },
  monthly: {
    price: '$4.99',
    period: '/ month',
    productId: 'monthly',
  },
  lifetime: {
    price: '$49.99',
    period: 'One-time',
    savings: 'Pay once, keep forever',
    productId: 'lifetime',
  },
};

const ENTITLEMENT_ID = 'premium';

type PurchasesModule = typeof import('react-native-purchases');
type PurchasesPackage = import('react-native-purchases').PurchasesPackage;

let configured = false;

function getPurchases(): PurchasesModule | null {
  if (Platform.OS === 'web') return null;
  try {
    return require('react-native-purchases') as PurchasesModule;
  } catch {
    return null;
  }
}

function planPackageIdentifiers(planId: PlanId): string[] {
  const productId = PLANS[planId].productId;
  if (planId === 'monthly') return ['$rc_monthly', 'monthly', productId];
  if (planId === 'annual') return ['$rc_annual', '$rc_yearly', 'yearly', productId];
  return ['$rc_lifetime', 'lifetime', productId];
}

function findPackage(
  packages: PurchasesPackage[],
  planId: PlanId,
): PurchasesPackage | undefined {
  const ids = planPackageIdentifiers(planId);
  return packages.find(
    (pkg) =>
      ids.includes(pkg.identifier) ||
      ids.includes(pkg.product.identifier) ||
      pkg.product.identifier === PLANS[planId].productId,
  );
}

export async function activatePremium(): Promise<void> {
  await setPremiumStatus(true);
}

export async function configureSubscriptions(): Promise<boolean> {
  if (env.isDev) return false;

  const apiKey = getRevenueCatApiKey();
  if (!apiKey) return false;

  const Purchases = getPurchases();
  if (!Purchases) return false;

  if (!configured) {
    Purchases.default.setLogLevel(Purchases.LOG_LEVEL.INFO);
    Purchases.default.configure({ apiKey });
    configured = true;
  }

  return true;
}

export async function syncPremiumFromStore(): Promise<boolean> {
  if (env.isDev) {
    return false;
  }

  const ready = await configureSubscriptions();
  if (!ready) return false;

  const Purchases = getPurchases();
  if (!Purchases) return false;

  const info = await Purchases.default.getCustomerInfo();
  const active = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  await setPremiumStatus(active);
  return active;
}

/**
 * Dev: mock purchase. Production: RevenueCat + Google Play / App Store.
 */
export async function purchasePlan(planId: PlanId): Promise<boolean> {
  if (env.isDev) {
    await activatePremium();
    return true;
  }

  const ready = await configureSubscriptions();
  if (!ready) {
    throw new Error(
      'Payments not configured. Set EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID (goog_…) and build with EAS.',
    );
  }

  const Purchases = getPurchases();
  if (!Purchases) {
    throw new Error('In-app purchases require a native build (not web).');
  }

  const offerings = await Purchases.default.getOfferings();
  const current = offerings.current;
  if (!current) {
    throw new Error('No RevenueCat offering configured. Check dashboard → Offerings.');
  }

  const pkg = findPackage(current.availablePackages, planId);
  if (!pkg) {
    throw new Error(
      `Product "${PLANS[planId].productId}" not found in RevenueCat offering. See store/payments.md`,
    );
  }

  const { customerInfo } = await Purchases.default.purchasePackage(pkg);
  const active = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  if (active) {
    await activatePremium();
  }
  return active;
}

export async function restorePurchases(): Promise<boolean> {
  if (env.isDev) {
    return false;
  }

  const ready = await configureSubscriptions();
  if (!ready) {
    throw new Error('Payments not configured.');
  }

  const Purchases = getPurchases();
  if (!Purchases) {
    throw new Error('Restore requires a native build.');
  }

  const info = await Purchases.default.restorePurchases();
  const active = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  if (active) {
    await activatePremium();
  }
  return active;
}

export function getPlanCta(planId: PlanId): string {
  const plan = PLANS[planId];
  if (planId === 'lifetime') {
    return i18n.t('subscription.lifetimeCta', { price: plan.price });
  }
  if (planId === 'annual') {
    return i18n.t('subscription.annualCta', { price: plan.perMonth ?? plan.price });
  }
  return i18n.t('subscription.monthlyCta', {
    price: plan.price,
    period: i18n.t('premium.plans.monthlyPeriod'),
  });
}
