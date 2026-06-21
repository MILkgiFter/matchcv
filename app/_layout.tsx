import '@/i18n';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/context/AppContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppInitializer } from '@/components/AppInitializer';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppInitializer>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="upload-resume" />
            <Stack.Screen name="analysis-result" />
            <Stack.Screen name="match-job" />
            <Stack.Screen name="cover-letter" />
            <Stack.Screen name="premium" />
            <Stack.Screen name="privacy-policy" />
            <Stack.Screen name="terms-of-service" />
            <Stack.Screen name="ai-model" />
          </Stack>
        </AppInitializer>
      </AppProvider>
    </ErrorBoundary>
  );
}
