import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTranslation } from 'react-i18next';
import { CircularProgress } from '@/components/CircularProgress';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { PremiumLockCard } from '@/components/PremiumLockCard';
import { useApp } from '@/context/AppContext';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { matchJob } from '@/services/resume';
import { extractJobTitle, saveJob, getSavedJobs } from '@/services/jobs';
import { FREE_LIMITS } from '@/constants/limits';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';

export default function MatchJobScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { jobDescription, setJobDescription, setMatchResult, matchResult, setSavedJobs } = useApp();
  const { gate, recordUsage, isPremium, remaining, openPaywall } = usePremiumGate();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(jobDescription);

  const visibleKeywords = matchResult
    ? isPremium
      ? matchResult.missingKeywords
      : matchResult.missingKeywords.slice(0, FREE_LIMITS.visibleKeywords)
    : [];
  const hiddenKeywords = matchResult
    ? Math.max(0, matchResult.missingKeywords.length - visibleKeywords.length)
    : 0;

  const runMatch = async () => {
    const text = description.trim();
    if (text.length < 20) {
      Alert.alert(t('matchJob.tooShort'), t('matchJob.tooShortSub'));
      return;
    }

    if (!gate('match', 'match')) return;

    setLoading(true);
    try {
      const result = await matchJob(text);
      await recordUsage('match');
      setMatchResult(result);
      setJobDescription(text);

      const saved = {
        id: Date.now().toString(),
        title: result.jobTitle ?? extractJobTitle(text),
        description: text,
        matchPercent: result.matchPercent,
        createdAt: Date.now(),
      };
      await saveJob(saved);
      setSavedJobs(await getSavedJobs());
    } catch (error) {
      Alert.alert(t('matchJob.aiError'), error instanceof Error ? error.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={t('matchJob.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('matchJob.jobDescription')}</Text>
        <TextInput
          style={styles.jobInput}
          multiline
          placeholder={t('matchJob.placeholder')}
          placeholderTextColor={Colors.textMuted}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />

        <PrimaryButton
          title={t('matchJob.analyze')}
          onPress={runMatch}
          loading={loading}
          style={{ marginBottom: Spacing.sm }}
        />
        {!isPremium && (
          <Text style={styles.quota}>
            {remaining('match') > 0
              ? t('matchJob.freeMatchLeft', { count: remaining('match') })
              : t('matchJob.freeMatchUsed')}
          </Text>
        )}

        {matchResult && (
          <>
            <View style={styles.matchCard}>
              <CircularProgress
                value={matchResult.matchPercent}
                max={100}
                size={140}
                strokeWidth={10}
                showPercent
                sublabel={matchResult.status}
              />
            </View>

            {matchResult.missingKeywords.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>{t('matchJob.missingKeywords')}</Text>
                <View style={styles.tags}>
                  {visibleKeywords.map((kw) => (
                    <View key={kw} style={styles.tag}>
                      <Text style={styles.tagText}>{kw}</Text>
                    </View>
                  ))}
                </View>
                {hiddenKeywords > 0 && (
                  <PremiumLockCard
                    title={t('common.keywordsHidden', { count: hiddenKeywords })}
                    subtitle={t('premium.sources.keywords.subtitle')}
                    onUnlock={() => openPaywall('keywords')}
                  />
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      {matchResult && (
        <View style={styles.footer}>
          <PrimaryButton title={t('matchJob.generateLetter')} onPress={() => router.push('/cover-letter')} />
        </View>
      )}

      <LoadingOverlay visible={loading} message="AI is analyzing match..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  jobInput: {
    fontSize: FontSize.sm, color: Colors.text, lineHeight: 22, minHeight: 160,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  matchCard: {
    alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.lg, elevation: 3,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: {
    backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.full,
    paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.primary,
  },
  tagText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  quota: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontWeight: '600',
  },
  footer: { padding: Spacing.lg, paddingBottom: Spacing.xl },
});
