import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, FontSize } from '@/constants/theme';

const tabs = [
  { key: 'home', icon: 'home' as const, route: '/(tabs)' },
  { key: 'jobs', icon: 'briefcase' as const, route: '/(tabs)/jobs' },
  { key: 'chat', icon: 'chatbubble-ellipses' as const, route: '/(tabs)/chat' },
  { key: 'profile', icon: 'person' as const, route: '/(tabs)/profile' },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (route: string) => {
    if (route === '/(tabs)') {
      return (
        pathname === '/' ||
        pathname === '/(tabs)' ||
        pathname.endsWith('/index') ||
        pathname === ''
      );
    }
    const segment = route.split('/').pop() ?? '';
    return pathname.includes(segment);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = isActive(tab.route);
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => router.push(tab.route as never)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={active ? tab.icon : (`${tab.icon}-outline` as never)}
              size={24}
              color={active ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.label, active && styles.labelActive]}>
              {t(`tabs.${tab.key}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
