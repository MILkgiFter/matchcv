import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ONBOARDING_DONE: 'onboarding_done',
  AUTH_TOKEN: 'auth_token',
  PREMIUM: 'premium_active',
} as const;

export async function isOnboardingDone(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
  return value === 'true';
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, 'true');
}

export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
}

export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN);
}

export async function isPremiumActive(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEYS.PREMIUM);
  return value === 'true';
}

export async function setPremiumStatus(active: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.PREMIUM, active ? 'true' : 'false');
}
