import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ApiBanner } from '@/components/ApiBanner';
import { useApp } from '@/context/AppContext';
import { useAppReady } from '@/hooks/useAppReady';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { checkApiHealth } from '@/services/health';
import { getSavedJobs } from '@/services/jobs';
import { configureSubscriptions, syncPremiumFromStore } from '@/services/subscription';
import { isPremiumActive } from '@/services/storage';
import { loadSavedLocale } from '@/i18n';
import { Colors } from '@/constants/theme';
import { ActivityIndicator } from 'react-native';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const ready = useAppReady();
  const { isConnected } = useNetworkStatus();
  const { setApiOnline, setPremium, setSavedJobs } = useApp();

  useEffect(() => {
    loadSavedLocale();
    (async () => {
      const fromStore = await syncPremiumFromStore();
      if (!fromStore) {
        isPremiumActive().then(setPremium);
      } else {
        setPremium(true);
      }
    })();
    getSavedJobs().then(setSavedJobs);
    configureSubscriptions().catch(() => {});
  }, [setPremium, setSavedJobs]);

  useEffect(() => {
    if (!isConnected) {
      setApiOnline(false);
      return;
    }
    checkApiHealth().then(setApiOnline);
  }, [isConnected, setApiOnline]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <OfflineBanner visible={!isConnected} />
      <ApiBanner />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
