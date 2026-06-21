import { ExpoConfig, ConfigContext } from 'expo/config';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
const isLocalApi = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');

export default ({ config }: ConfigContext): ExpoConfig => ({  ...config,
  name: 'MatchCV',
  slug: 'matchcv',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'matchcv',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FF7A33',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.matchcv.app',
    buildNumber: '1',
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      NSCameraUsageDescription: 'Used to scan documents for your resume.',
      NSPhotoLibraryUsageDescription: 'Used to import resume files from your library.',
      ITSAppUsesNonExemptEncryption: false,
    },
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
          NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
        },
      ],
    },
  },
  android: {
    package: 'com.matchcv.app',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FF7A33',
    },
    permissions: ['INTERNET'],
    blockedPermissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.CAMERA',
    ],
  },
  plugins: [
    'expo-localization',
    'expo-router',
    'expo-asset',
    'expo-secure-store',
    'expo-document-picker',
    [
      'expo-build-properties',
      {
        android: {
          minSdkVersion: 24,
          targetSdkVersion: 35,
          compileSdkVersion: 35,
          usesCleartextTraffic: isLocalApi,
        },
        ios: {
          deploymentTarget: '15.1',
        },
      },
    ],
  ],
  ...(process.env.EAS_UPDATE_URL
    ? {
        updates: {
          url: process.env.EAS_UPDATE_URL,
          fallbackToCacheTimeout: 0,
          checkAutomatically: 'ON_LOAD',
        },
        runtimeVersion: { policy: 'appVersion' as const },
      }
    : {}),
  extra: {
    apiUrl,
    apiKey: process.env.EXPO_PUBLIC_API_KEY ?? '',
    privacyUrl: process.env.EXPO_PUBLIC_PRIVACY_URL ?? 'https://your-domain.com/privacy',
    termsUrl: process.env.EXPO_PUBLIC_TERMS_URL ?? 'https://your-domain.com/terms',
    revenueCatApiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '',
    revenueCatAndroidApiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? '',
    revenueCatIosApiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? '',
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
  owner: process.env.EXPO_OWNER,
});
