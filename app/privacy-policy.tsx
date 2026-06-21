import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView, Linking } from 'react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { env } from '@/config/env';
import { Colors, FontSize, Spacing } from '@/constants/theme';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Privacy Policy" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Last updated: June 2026</Text>

        <Text style={styles.section}>1. Information We Collect</Text>
        <Text style={styles.body}>
          We collect resume files you upload, job descriptions you provide, and chat
          messages sent to the AI assistant. Account email is optional.
        </Text>

        <Text style={styles.section}>2. How We Use Data</Text>
        <Text style={styles.body}>
          Your data is used to analyze resumes, match jobs, generate cover letters, and
          provide MatchCV features (analysis, job match, cover letters, coach). We do not sell your personal data.
        </Text>

        <Text style={styles.section}>3. AI Processing</Text>
        <Text style={styles.body}>
          Resume content may be sent to third-party AI providers (e.g. Groq, OpenAI) for
          processing. Data is transmitted over encrypted HTTPS connections.
        </Text>

        <Text style={styles.section}>4. Data Retention</Text>
        <Text style={styles.body}>
          Uploaded files and analysis results are stored only as long as needed to provide
          the service. You may request deletion by contacting support.
        </Text>

        <Text style={styles.section}>5. Your Rights</Text>
        <Text style={styles.body}>
          You may request access, correction, or deletion of your data. Contact us at
          support@matchcv.app.
        </Text>

        <Text style={styles.link} onPress={() => Linking.openURL(env.privacyUrl)}>
          View full policy online →{'\n'}
          <Text style={styles.url}>{env.privacyUrl}</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  updated: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
  },
  section: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  body: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  link: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Spacing.xl,
  },
  url: {
    fontSize: FontSize.xs,
    fontWeight: '400',
    color: Colors.textMuted,
  },
});
