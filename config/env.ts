import Constants from 'expo-constants';
import { Platform } from 'react-native';

type Extra = {
  apiUrl?: string;
  apiKey?: string;
  privacyUrl?: string;
  termsUrl?: string;
  revenueCatApiKey?: string;
  revenueCatAndroidApiKey?: string;
  revenueCatIosApiKey?: string;
  eas?: { projectId?: string };
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

const publicEnv = (name: string): string | undefined =>
  (process.env as Record<string, string | undefined>)[name];

export const env = {
  apiUrl:
    extra.apiUrl ??
    publicEnv('EXPO_PUBLIC_API_URL') ??
    'http://localhost:3001',
  apiKey:
    extra.apiKey ??
    publicEnv('EXPO_PUBLIC_API_KEY') ??
    (__DEV__ ? 'dev-local-api-key-2026' : ''),
  privacyUrl:
    extra.privacyUrl ??
    publicEnv('EXPO_PUBLIC_PRIVACY_URL') ??
    'https://your-domain.com/privacy',
  termsUrl:
    extra.termsUrl ??
    publicEnv('EXPO_PUBLIC_TERMS_URL') ??
    'https://your-domain.com/terms',
  revenueCatApiKey:
    extra.revenueCatApiKey ?? publicEnv('EXPO_PUBLIC_REVENUECAT_API_KEY') ?? '',
  revenueCatAndroidApiKey:
    extra.revenueCatAndroidApiKey ??
    publicEnv('EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID') ??
    publicEnv('EXPO_PUBLIC_REVENUECAT_API_KEY') ??
    '',
  revenueCatIosApiKey:
    extra.revenueCatIosApiKey ??
    publicEnv('EXPO_PUBLIC_REVENUECAT_API_KEY_IOS') ??
    '',
  isDev: __DEV__,
  easProjectId: extra.eas?.projectId,
};

export function getRevenueCatApiKey(): string {
  if (Platform.OS === 'ios') {
    return env.revenueCatIosApiKey || env.revenueCatApiKey;
  }
  return env.revenueCatAndroidApiKey || env.revenueCatApiKey;
}
