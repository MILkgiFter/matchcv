import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Illustration } from '@/components/Illustration';
import { OutlineButton } from '@/components/OutlineButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useApp } from '@/context/AppContext';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { analyzeResume } from '@/services/resume';
import { pickResumeFile } from '@/utils/documentPicker';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';

export default function UploadResumeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { resumeFile, setResumeFile, setAnalysis, setLoading, isLoading, setError } =
    useApp();
  const { gate, recordUsage, isPremium, remaining } = usePremiumGate();
  const [localLoading, setLocalLoading] = useState(false);

  const handlePick = async (type: 'pdf' | 'docx') => {
    const file = await pickResumeFile(type);
    if (file) {
      setResumeFile(file);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      Alert.alert(t('upload.noFile'), t('upload.noFileSub'));
      return;
    }

    if (!gate('analysis', 'analysis')) return;

    setLocalLoading(true);
    setLoading(true);
    try {
      const result = await analyzeResume(resumeFile);
      await recordUsage('analysis');
      setAnalysis(result);
      router.push('/analysis-result');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      setError(message);
      Alert.alert(t('common.error'), message);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={t('upload.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.illustration}>
          <Illustration type="upload-resume" />
        </View>

        <View style={styles.dropZone}>
          <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
          {resumeFile ? (
            <>
              <Text style={styles.dropText}>{resumeFile.name}</Text>
              <Text style={styles.dropSub}>
                {(resumeFile.size ? resumeFile.size / 1024 : 0).toFixed(0)} KB
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.dropText}>{t('upload.dropHint')}</Text>
              <Text style={styles.dropSub}>{t('upload.dropSub')}</Text>
            </>
          )}
        </View>

        <View style={styles.buttons}>
          <OutlineButton
            title="Choose PDF"
            onPress={() => handlePick('pdf')}
            icon={<Ionicons name="document" size={20} color={Colors.primary} />}
          />
          <OutlineButton
            title="Choose DOCX"
            onPress={() => handlePick('docx')}
            icon={<Ionicons name="document-text" size={20} color={Colors.primary} />}
          />
          <OutlineButton
            title="Import from LinkedIn"
            onPress={() =>
              Alert.alert('Coming soon', 'LinkedIn import will be available in the next update.')
            }
            icon={
              <View style={styles.linkedinIcon}>
                <Text style={styles.linkedinText}>in</Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!isPremium && (
          <Text style={styles.quota}>
            {remaining('analysis') > 0
              ? t('upload.freeScanLeft', { count: remaining('analysis') })
              : t('upload.freeScanUsed')}
          </Text>
        )}
        <PrimaryButton
          title={t('upload.analyze')}
          onPress={handleAnalyze}
          loading={localLoading || isLoading}
          disabled={!resumeFile}
        />
      </View>

      <LoadingOverlay visible={localLoading} message="Analyzing resume..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  illustration: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  dropZone: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryLight,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dropText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  dropSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  buttons: { gap: Spacing.sm },
  linkedinIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#0A66C2',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedinText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 12,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  quota: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
});
