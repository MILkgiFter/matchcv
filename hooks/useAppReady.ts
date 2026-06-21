import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

export function useAppReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        if (!__DEV__ && Updates.isEnabled) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
            return;
          }
        }
      } catch (error) {
        if (!__DEV__) {
          console.warn('OTA update check failed:', error);
        }
      } finally {
        setReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return ready;
}

export async function showUpdatePrompt() {
  if (__DEV__ || !Updates.isEnabled) return;

  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      Alert.alert('Update available', 'Download the latest version?', [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          },
        },
      ]);
    }
  } catch {
    // silent
  }
}

export function getAppVersion(): string {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const channel = Updates.channel;
  return channel ? `${version} (${channel})` : version;
}
