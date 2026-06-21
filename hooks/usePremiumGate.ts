import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { remainingFree } from '@/services/usage';
import type { PremiumSource, UsageFeature } from '@/constants/limits';

export function usePremiumGate() {
  const router = useRouter();
  const { isPremium, usage, canUse, recordUsage } = useApp();

  const remaining = useCallback(
    (feature: UsageFeature) => remainingFree(feature, usage, isPremium),
    [usage, isPremium],
  );

  const openPaywall = useCallback(
    (source: PremiumSource, extra?: Record<string, string>) => {
      const params = new URLSearchParams({ from: source, ...extra });
      router.push(`/premium?${params.toString()}` as never);
    },
    [router],
  );

  const gate = useCallback(
    (feature: UsageFeature, source: PremiumSource): boolean => {
      if (canUse(feature)) return true;
      openPaywall(source);
      return false;
    },
    [canUse, openPaywall],
  );

  const gatePremiumOnly = useCallback(
    (source: PremiumSource): boolean => {
      if (isPremium) return true;
      openPaywall(source);
      return false;
    },
    [isPremium, openPaywall],
  );

  return {
    isPremium,
    usage,
    gate,
    gatePremiumOnly,
    openPaywall,
    recordUsage,
    canUse,
    remaining,
  };
}
