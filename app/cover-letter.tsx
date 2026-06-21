import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { EmptyState } from '@/components/EmptyState';
import { PremiumLockCard } from '@/components/PremiumLockCard';
import { useApp } from '@/context/AppContext';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { generateCoverLetter } from '@/services/coverLetter';
import type { CoverLetterTone } from '@/types/api';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';

const tones: CoverLetterTone[] = ['Formal', 'Friendly', 'Confident'];

export default function CoverLetterScreen() {
  const { coverLetter, setCoverLetter, jobDescription, incrementCoverLetters } = useApp();
  const { gate, recordUsage, isPremium, remaining, openPaywall } = usePremiumGate();
  const [tone, setTone] = useState<CoverLetterTone>('Formal');
  const [loading, setLoading] = useState(false);

  const loadLetter = async (selectedTone: CoverLetterTone) => {
    if (!jobDescription.trim()) {
      Alert.alert('Job required', 'Match a job first to generate a tailored cover letter.');
      return;
    }

    if (!gate('coverLetter', 'coverLetter')) return;

    setLoading(true);
    try {
      const result = await generateCoverLetter(selectedTone, jobDescription);
      await recordUsage('coverLetter');
      setCoverLetter(result);
      setTone(selectedTone);
      incrementCoverLetters();
    } catch (error) {
      Alert.alert('AI Error', error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!coverLetter?.letter) return;
    await Share.share({ message: coverLetter.letter, title: 'Cover Letter' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Cover Letter" />
      <ScrollView contentContainerStyle={styles.content}>
        {!jobDescription ? (
          <EmptyState
            icon="mail-outline"
            title="No job selected"
            message="Go to Match Job, paste a description and analyze it. Then return here to generate a cover letter."
          />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Tone</Text>
            {!isPremium && (
              <Text style={styles.quota}>
                {remaining('coverLetter') > 0
                  ? `${remaining('coverLetter')} free letter · all 3 tones included`
                  : 'Free letter used'}
              </Text>
            )}
            <View style={styles.toneRow}>
              {tones.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.toneBtn, tone === t && styles.toneBtnActive]}
                  onPress={() => loadLetter(t)}
                >
                  <Text style={[styles.toneText, tone === t && styles.toneTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {!isPremium && remaining('coverLetter') === 0 && !coverLetter?.letter && (
              <PremiumLockCard
                title="Unlock unlimited cover letters"
                subtitle="Generate Formal, Friendly & Confident letters for every job application."
                onUnlock={() => openPaywall('coverLetter')}
              />
            )}

            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.letterBox}>
              <Text style={styles.letterText}>
                {coverLetter?.letter ?? 'Select a tone to generate your letter with AI.'}
              </Text>
            </View>
            {!isPremium && coverLetter?.letter && (
              <PremiumLockCard
                title="Want another tone or job?"
                subtitle="Premium includes unlimited cover letters for every application."
                onUnlock={() => openPaywall('coverLetter')}
              />
            )}
          </>
        )}
      </ScrollView>

      {coverLetter?.letter && (
        <View style={styles.footer}>
          <PrimaryButton title="Share" onPress={handleShare} />
        </View>
      )}

      <LoadingOverlay visible={loading} message="AI is writing..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  quota: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  toneRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  toneBtn: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.white,
  },
  toneBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toneText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  toneTextActive: { color: Colors.white },
  letterBox: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, minHeight: 300,
  },
  letterText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 24 },
  footer: { padding: Spacing.lg, paddingBottom: Spacing.xl },
});
