import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { BottomNav } from '@/components/BottomNav';
import { LanguagePickerModal } from '@/components/LanguagePickerModal';
import { getAppLocale } from '@/i18n';
import { getAppVersion } from '@/hooks/useAppReady';
import { useApp } from '@/context/AppContext';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { FREE_LIMITS } from '@/constants/limits';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';

const menuItems = [
  { icon: 'document-text' as const, labelKey: 'profile.myResume', route: '/upload-resume' },
  { icon: 'analytics' as const, labelKey: 'profile.analysisResult', route: '/analysis-result' },
  { icon: 'hardware-chip' as const, labelKey: 'profile.localAi', route: '/ai-model' },
  { icon: 'diamond' as const, labelKey: 'common.premium', route: '/premium' },
  { icon: 'shield-checkmark' as const, labelKey: 'profile.privacy', route: '/privacy-policy' },
  { icon: 'document' as const, labelKey: 'profile.terms', route: '/terms-of-service' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const { analysis, savedJobs, coverLetterCount, resumeFile, isPremium, usage } = useApp();
  const { openPaywall, remaining } = usePremiumGate();

  const initial = resumeFile?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>
            {resumeFile ? resumeFile.name.replace(/\.[^.]+$/, '') : t('profile.yourProfile')}
          </Text>
          <Text style={styles.email}>
            {isPremium ? t('profile.premiumMember') : t('profile.freePlan')}
          </Text>
          {!isPremium && (
            <TouchableOpacity
              style={styles.premiumBanner}
              onPress={() => openPaywall('profile')}
            >
              <Ionicons name="diamond" size={18} color={Colors.primary} />
              <View style={styles.premiumBannerText}>
                <Text style={styles.premiumText}>{t('profile.upgradeTitle')}</Text>
                <Text style={styles.premiumSub}>{t('profile.upgradeSub')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {!isPremium && (
          <View style={styles.limitsCard}>
            <Text style={styles.limitsTitle}>{t('profile.freeUsage')}</Text>
            <Text style={styles.limitRow}>
              {t('profile.scans', { used: usage.analysis, limit: FREE_LIMITS.resumeAnalysis })}
            </Text>
            <Text style={styles.limitRow}>
              {t('profile.matches', { used: usage.match, limit: FREE_LIMITS.jobMatch })}
            </Text>
            <Text style={styles.limitRow}>
              {t('profile.letters', { used: usage.coverLetter, limit: FREE_LIMITS.coverLetter })}
            </Text>
            <Text style={styles.limitRow}>
              {t('profile.chatToday', { used: usage.chatToday, limit: FREE_LIMITS.chatMessagesPerDay })}
            </Text>
            {(remaining('analysis') === 0 ||
              remaining('match') === 0 ||
              remaining('chat') === 0) && (
              <TouchableOpacity onPress={() => openPaywall('profile')}>
                <Text style={styles.limitsCta}>{t('profile.upgradeUnlimited')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{analysis?.score ?? '—'}</Text>
            <Text style={styles.statLabel}>{t('home.resumeScore')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{savedJobs.length}</Text>
            <Text style={styles.statLabel}>{t('profile.jobsMatched')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{coverLetterCount}</Text>
            <Text style={styles.statLabel}>{t('profile.coverLetters')}</Text>
          </View>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setLangOpen(true)}>
            <View style={styles.menuLeft}>
              <Ionicons name="language" size={22} color={Colors.primary} />
              <View>
                <Text style={styles.menuLabel}>{t('profile.language')}</Text>
                <Text style={styles.menuSub}>{t(`languages.${getAppLocale()}`)}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.labelKey}
              style={styles.menuItem}
              onPress={() => item.route && router.push(item.route as never)}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={22} color={Colors.primary} />
                <Text style={styles.menuLabel}>{t(item.labelKey)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>{t('common.version', { version: getAppVersion() })}</Text>
        <View style={{ height: 20 }} />
      </ScrollView>
      <LanguagePickerModal visible={langOpen} onClose={() => setLangOpen(false)} />
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  profileHeader: { alignItems: 'center', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  avatarText: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.white },
  name: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  premiumBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: 10, marginTop: Spacing.lg, alignSelf: 'stretch',
  },
  premiumBannerText: { flex: 1 },
  premiumText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  premiumSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  limitsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  limitsTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  limitRow: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  limitsCta: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.white, marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, elevation: 2,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border },
  menu: {
    marginHorizontal: Spacing.lg, backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, overflow: 'hidden', elevation: 2,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  menuSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.lg },
});
