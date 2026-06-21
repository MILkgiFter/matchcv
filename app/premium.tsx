import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Illustration } from '@/components/Illustration';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useApp } from '@/context/AppContext';
import {
  PLANS,
  purchasePlan,
  restorePurchases,
  getPlanCta,
  type PlanId,
} from '@/services/subscription';
import type { PremiumSource } from '@/constants/limits';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';

const featureKeys = ['scans', 'match', 'letters', 'coach', 'priority', 'cancel'] as const;
const featureIcons = {
  scans: 'infinite',
  match: 'search',
  letters: 'mail',
  coach: 'chatbubbles',
  priority: 'trending-up',
  cancel: 'shield-checkmark',
} as const;

const planOrder: PlanId[] = ['annual', 'monthly', 'lifetime'];

export default function PremiumScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ from?: string; score?: string }>();
  const { setPremium, analysis, isPremium } = useApp();
  const source = (params.from as PremiumSource) ?? 'profile';
  const score = params.score ? Number(params.score) : analysis?.score;
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('annual');
  const [loading, setLoading] = useState(false);

  if (isPremium) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title={t('premium.title')} />
        <View style={styles.activeWrap}>
          <Ionicons name="diamond" size={48} color={Colors.primary} />
          <Text style={styles.activeTitle}>{t('premium.activeTitle')}</Text>
          <Text style={styles.activeSub}>{t('premium.activeSub')}</Text>
          <PrimaryButton title={t('premium.backToApp')} onPress={() => router.back()} style={{ marginTop: Spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const success = await purchasePlan(selectedPlan);
      if (success) {
        setPremium(true);
        Alert.alert(t('premium.welcome'), t('premium.welcomeSub'));
        router.back();
      }
    } catch (error) {
      Alert.alert(t('premium.purchaseFailed'), error instanceof Error ? error.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        setPremium(true);
        Alert.alert(t('premium.restored'), t('premium.restoredSub'));
      } else {
        Alert.alert(t('premium.noPurchases'), t('premium.noPurchasesSub'));
      }
    } catch (error) {
      Alert.alert(t('premium.restoreFailed'), error instanceof Error ? error.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={t('premium.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.crownSection}>
          <Illustration type="crown" width={160} height={120} />
        </View>

        <View style={styles.socialProof}>
          <Ionicons name="people" size={16} color={Colors.primary} />
          <Text style={styles.socialText}>{t('premium.socialProof')}</Text>
        </View>

        {source !== 'profile' && (
          <View style={styles.contextBadge}>
            <Ionicons name="flash" size={14} color={Colors.white} />
            <Text style={styles.contextBadgeText}>{t('premium.limitedBadge')}</Text>
          </View>
        )}

        <Text style={styles.headline}>{t(`premium.sources.${source}.title`)}</Text>
        <Text style={styles.subheadline}>{t(`premium.sources.${source}.subtitle`)}</Text>

        {score != null && score < 90 && (
          <View style={styles.scoreTeaser}>
            <Text style={styles.scoreTeaserLabel}>{t('premium.scoreNow')}</Text>
            <Text style={styles.scoreNow}>{score}%</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
            <View>
              <Text style={styles.scoreTeaserLabel}>{t('premium.withPremium')}</Text>
              <Text style={styles.scoreGoal}>90%+</Text>
            </View>
          </View>
        )}

        {featureKeys.map((key) => (
          <View key={key} style={styles.featureRow}>
            <Ionicons name={featureIcons[key]} size={20} color={Colors.primary} />
            <Text style={styles.featureText}>{t(`premium.features.${key}`)}</Text>
          </View>
        ))}

        <View style={styles.plans}>
          {planOrder.map((planId) => {
            const plan = PLANS[planId];
            const active = selectedPlan === planId;
            return (
              <TouchableOpacity
                key={planId}
                style={[styles.planCard, active && styles.planCardActive]}
                onPress={() => setSelectedPlan(planId)}
              >
                {planId === 'annual' && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{t('premium.plans.bestValue')}</Text>
                  </View>
                )}
                <View style={styles.radio}>
                  {active && <View style={styles.radioInner} />}
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planPrice}>
                    {plan.price}
                    <Text style={styles.planPeriod}>
                      {' '}
                      {planId === 'lifetime'
                        ? t('premium.plans.lifetimePeriod')
                        : planId === 'annual'
                          ? t('premium.plans.yearlyPeriod')
                          : t('premium.plans.monthlyPeriod')}
                    </Text>
                  </Text>
                  {planId === 'annual' && (
                    <Text style={styles.planMeta}>{t('premium.plans.perMonth')}</Text>
                  )}
                  {planId === 'lifetime' && (
                    <Text style={styles.planMeta}>{t('premium.plans.lifetimeSavings')}</Text>
                  )}
                  {planId === 'annual' && (
                    <Text style={styles.planSavings}>{t('premium.plans.save50')}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.legal}>{t('premium.legal')}</Text>

        <View style={styles.legalLinks}>
          <Link href="/terms-of-service" style={styles.link}>
            {t('premium.terms')}
          </Link>
          <Text style={styles.linkDot}>·</Text>
          <Link href="/privacy-policy" style={styles.link}>
            {t('premium.privacy')}
          </Link>
          <Text style={styles.linkDot}>·</Text>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.link}>{t('premium.restore')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={source !== 'profile' ? t(`premium.sources.${source}.cta`) : getPlanCta(selectedPlan)}
          onPress={handlePurchase}
          loading={loading}
        />
        <Text style={styles.footerNote}>
          {selectedPlan === 'annual' ? t('premium.mostUsers') : ''}
          {t('premium.guarantee')}
        </Text>
      </View>

      <LoadingOverlay visible={loading} message={t('premium.processing')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  crownSection: { alignItems: 'center', paddingTop: Spacing.sm },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  socialText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: Spacing.md,
  },
  contextBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.white },
  headline: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subheadline: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  scoreTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  scoreTeaserLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  scoreNow: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.warning },
  scoreGoal: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.success },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 10,
    paddingHorizontal: Spacing.xs,
  },
  featureText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500', flex: 1 },
  plans: { marginTop: Spacing.lg, gap: Spacing.sm },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    position: 'relative',
    overflow: 'visible',
  },
  planCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  badge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: Colors.white },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  planInfo: { flex: 1 },
  planPrice: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  planPeriod: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textSecondary },
  planMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  planSavings: { fontSize: FontSize.xs, color: Colors.success, fontWeight: '700', marginTop: 2 },
  legal: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.lg,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  link: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  linkDot: { color: Colors.textMuted },
  footer: { padding: Spacing.lg, paddingBottom: Spacing.xl, backgroundColor: Colors.background },
  footerNote: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  activeWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  activeTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, marginTop: Spacing.md },
  activeSub: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
