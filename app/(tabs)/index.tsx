import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { BottomNav } from '@/components/BottomNav';
import { CircularProgress } from '@/components/CircularProgress';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PremiumBanner } from '@/components/PremiumBanner';
import { useApp } from '@/context/AppContext';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';

const quickActionKeys = [
  { icon: 'cloud-upload' as const, labelKey: 'home.uploadResume', route: '/upload-resume' },
  { icon: 'search' as const, labelKey: 'home.matchJob', route: '/match-job' },
  { icon: 'mail' as const, labelKey: 'home.coverLetter', route: '/cover-letter' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { analysis, resumeFile, savedJobs, isPremium } = useApp();
  const { openPaywall } = usePremiumGate();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>MatchCV</Text>
          <Text style={styles.subGreeting}>{t('home.tagline')}</Text>
        </View>

        {!isPremium && analysis && (
          <PremiumBanner
            title={
              analysis.score < 90
                ? t('home.boostScore', { score: analysis.score })
                : t('home.unlockTools')
            }
            subtitle={t('home.bannerSubtitle')}
            onPress={() =>
              openPaywall('home', { score: String(analysis.score) })
            }
          />
        )}

        {analysis ? (
          <TouchableOpacity
            style={styles.scoreCard}
            onPress={() => router.push('/analysis-result')}
            activeOpacity={0.9}
          >
            <CircularProgress value={analysis.score} max={100} size={120} strokeWidth={8} />
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreTitle}>{t('home.resumeScore')}</Text>
              <Text style={styles.scoreStatus}>{analysis.status}</Text>
              {resumeFile && (
                <Text style={styles.fileName} numberOfLines={1}>{resumeFile.name}</Text>
              )}
            </View>
          </TouchableOpacity>
        ) : (
          <EmptyState
            icon="document-text-outline"
            title={t('home.noResumeTitle')}
            message={t('home.noResumeMessage')}
            action={
              <PrimaryButton
                title={t('home.uploadResume')}
                onPress={() => router.push('/upload-resume')}
                style={{ marginTop: Spacing.md, width: '100%' }}
              />
            }
          />
        )}

        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
        <View style={styles.actionsRow}>
          {quickActionKeys.map((action) => (
            <TouchableOpacity
              key={action.labelKey}
              style={styles.actionCard}
              onPress={() => router.push(action.route as never)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{t(action.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {savedJobs.length > 0 && (
          <>
            <View style={styles.jobsHeader}>
              <Text style={styles.sectionTitle}>{t('home.matchedJobs')}</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')}>
                <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            {savedJobs.slice(0, 3).map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() => router.push('/match-job')}
              >
                <View style={styles.jobIcon}>
                  <Ionicons name="briefcase" size={22} color={Colors.primary} />
                </View>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                  <Text style={styles.jobMatch}>{t('common.matchPercent', { percent: job.matchPercent })}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1, paddingHorizontal: Spacing.lg },
  header: { paddingVertical: Spacing.md },
  greeting: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  subGreeting: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: Spacing.lg,
  },
  scoreInfo: { flex: 1 },
  scoreTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  scoreStatus: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  fileName: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 6 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  jobsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600', marginBottom: Spacing.md },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    elevation: 2,
  },
  jobIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  jobMatch: { fontSize: FontSize.sm, color: Colors.primary, marginTop: 2, fontWeight: '600' },
});
