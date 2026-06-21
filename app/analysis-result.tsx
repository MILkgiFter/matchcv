import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { CircularProgress } from '@/components/CircularProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import { PremiumLockCard } from '@/components/PremiumLockCard';
import { useApp } from '@/context/AppContext';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { FREE_LIMITS } from '@/constants/limits';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';

export default function AnalysisResultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { analysis } = useApp();
  const { isPremium, gatePremiumOnly, openPaywall } = usePremiumGate();

  const visibleMetrics = analysis
    ? isPremium
      ? analysis.metrics
      : analysis.metrics.slice(0, FREE_LIMITS.visibleMetrics)
    : [];
  const hiddenMetricsCount = analysis
    ? Math.max(0, analysis.metrics.length - visibleMetrics.length)
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={t('analysis.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        {!analysis ? (
          <EmptyState
            icon="analytics-outline"
            title={t('analysis.noAnalysis')}
            message={t('analysis.noAnalysisMessage')}
            action={
              <PrimaryButton
                title={t('home.uploadResume')}
                onPress={() => router.push('/upload-resume')}
                style={{ marginTop: Spacing.md, width: '100%' }}
              />
            }
          />
        ) : (
          <>
            <View style={styles.scoreSection}>
              <CircularProgress value={analysis.score} max={100} size={150} strokeWidth={10} />
              <Text style={styles.scoreLabel}>{t('analysis.overallScore')}</Text>
              <Text style={styles.scoreStatus}>{analysis.status}</Text>
              {!isPremium && analysis.score < 90 && (
                <Text style={styles.scoreHint}>{t('analysis.premiumHint')}</Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>{t('analysis.breakdown')}</Text>
            {visibleMetrics.map((metric) => (
              <View key={metric.label} style={styles.metricRow}>
                <View style={styles.metricLeft}>
                  <Ionicons
                    name={metric.good ? 'checkmark-circle' : 'alert-circle'}
                    size={22}
                    color={metric.good ? Colors.success : Colors.warning}
                  />
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                </View>
                <Text style={styles.metricScore}>{metric.score}/100</Text>
              </View>
            ))}

            {hiddenMetricsCount > 0 && (
              <PremiumLockCard
                title={t('common.moreLocked', { count: hiddenMetricsCount })}
                subtitle={t('premium.sources.metrics.subtitle')}
                onUnlock={() =>
                  openPaywall('metrics', { score: String(analysis.score) })
                }
              />
            )}
          </>
        )}
      </ScrollView>

      {analysis && (
        <View style={styles.footer}>
          <PrimaryButton
            title={isPremium ? t('analysis.improveResume') : t('analysis.improvePremium')}
            onPress={() => {
              if (!gatePremiumOnly('improve')) return;
              Alert.alert(t('analysis.comingSoon'), t('analysis.comingSoonSub'));
            }}
          />
          {!isPremium && (
            <Text style={styles.footerHint}>{t('analysis.footerHint')}</Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  scoreSection: {
    alignItems: 'center', paddingVertical: Spacing.lg, backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, marginBottom: Spacing.lg, elevation: 3,
  },
  scoreLabel: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.sm, fontWeight: '600' },
  scoreStatus: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  scoreHint: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  metricRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, elevation: 1,
  },
  metricLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  metricLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  metricScore: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  footer: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  footerHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
