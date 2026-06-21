import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { setOnboardingDone } from '@/services/storage';
import { Illustration } from '@/components/Illustration';
import { ONBOARDING_ILLUSTRATIONS, ONBOARDING_STEP_COUNT } from '@/constants/onboarding';
import { Colors, FontSize, Spacing } from '@/constants/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const isLast = step === ONBOARDING_STEP_COUNT - 1;
  const illustration = ONBOARDING_ILLUSTRATIONS[step];

  const finishOnboarding = async () => {
    await setOnboardingDone();
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (isLast) {
      finishOnboarding();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.skip} onPress={finishOnboarding}>
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>

        <View style={styles.illustration}>
          <Illustration type={illustration} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{t(`onboarding.steps.${step}.title`)}</Text>
          <Text style={styles.subtitle}>{t(`onboarding.steps.${step}.subtitle`)}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {ONBOARDING_ILLUSTRATIONS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === step && styles.dotActive]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Ionicons name="chevron-forward" size={28} color={Colors.white} />
            <Ionicons
              name="chevron-forward"
              size={28}
              color={Colors.white}
              style={{ marginLeft: -14 }}
            />
          </TouchableOpacity>
        </View>

        {isLast && (
          <TouchableOpacity
            style={styles.premiumLink}
            onPress={async () => {
              await setOnboardingDone();
              router.replace('/premium?from=home');
            }}
          >
            <Ionicons name="diamond" size={16} color={Colors.primary} />
            <Text style={styles.premiumLinkText}>{t('onboarding.premiumLink')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  skip: {
    alignSelf: 'flex-end',
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  illustration: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  nextBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  premiumLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: Spacing.lg,
  },
  premiumLinkText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
});
