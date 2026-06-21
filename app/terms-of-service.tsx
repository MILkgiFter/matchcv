import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView } from 'react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors, FontSize, Spacing } from '@/constants/theme';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Terms of Service" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Last updated: June 2026</Text>

        <Text style={styles.section}>1. Acceptance</Text>
        <Text style={styles.body}>
          By using MatchCV you agree to these terms. If you do not agree,
          do not use the app.
        </Text>

        <Text style={styles.section}>2. Service</Text>
        <Text style={styles.body}>
          The app provides AI-powered resume analysis, job matching, and career tools.
          Results are for guidance only and do not guarantee employment outcomes.
        </Text>

        <Text style={styles.section}>3. Subscriptions</Text>
        <Text style={styles.body}>
          Premium features require a paid subscription. Subscriptions auto-renew unless
          cancelled through your app store account settings.
        </Text>

        <Text style={styles.section}>4. User Content</Text>
        <Text style={styles.body}>
          You retain ownership of content you upload. You grant us a license to process
          it solely to provide the service.
        </Text>

        <Text style={styles.section}>5. Limitation of Liability</Text>
        <Text style={styles.body}>
          The service is provided &quot;as is&quot;. We are not liable for decisions made
          based on AI-generated content.
        </Text>

        <Text style={styles.section}>6. Contact</Text>
        <Text style={styles.body}>Questions: support@matchcv.app</Text>
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
});
