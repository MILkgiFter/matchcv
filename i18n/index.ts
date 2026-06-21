import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LOCALE_STORAGE_KEY = 'app_locale';

export const SUPPORTED_LOCALES = ['en', 'pt-BR', 'es', 'pl', 'de', 'fr', 'tr'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const resources = {
  en: { translation: require('./locales/en.json') },
  'pt-BR': { translation: require('./locales/pt-BR.json') },
  es: { translation: require('./locales/es.json') },
  pl: { translation: require('./locales/pl.json') },
  de: { translation: require('./locales/de.json') },
  fr: { translation: require('./locales/fr.json') },
  tr: { translation: require('./locales/tr.json') },
};

export function resolveDeviceLocale(): AppLocale {
  const tag = Localization.getLocales()[0]?.languageTag ?? 'en';
  const lower = tag.toLowerCase();
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('pl')) return 'pl';
  if (lower.startsWith('de')) return 'de';
  if (lower.startsWith('fr')) return 'fr';
  if (lower.startsWith('tr')) return 'tr';
  return 'en';
}

export function normalizeLocale(value: string | null | undefined): AppLocale {
  if (value && SUPPORTED_LOCALES.includes(value as AppLocale)) {
    return value as AppLocale;
  }
  return 'en';
}

export function getAppLocale(): AppLocale {
  return normalizeLocale(i18n.language);
}

export async function loadSavedLocale(): Promise<void> {
  const saved = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved && SUPPORTED_LOCALES.includes(saved as AppLocale)) {
    await i18n.changeLanguage(saved);
  }
}

export async function setAppLocale(locale: AppLocale): Promise<void> {
  await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
  await i18n.changeLanguage(locale);
}

i18n.use(initReactI18next).init({
  resources,
  lng: resolveDeviceLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18n;
