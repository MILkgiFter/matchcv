import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';

type Props = {
  title: string;
  subtitle: string;
  onPress: () => void;
  compact?: boolean;
};

export function PremiumBanner({ title, subtitle, onPress, compact }: Props) {
  return (
    <TouchableOpacity
      style={[styles.banner, compact && styles.bannerCompact]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="diamond" size={compact ? 18 : 22} color={Colors.primary} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
        {!compact && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  bannerCompact: { paddingVertical: 10 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  title: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  titleCompact: { fontSize: FontSize.sm },
  subtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
});
