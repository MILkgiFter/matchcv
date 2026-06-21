import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useApp } from '@/context/AppContext';
import { LOCAL_MODEL } from '@/constants/model';
import {
  deleteLocalModel,
  downloadModel,
  getDownloadedSizeMb,
  isModelDownloaded,
  isNativeLlamaAvailable,
  loadLocalModel,
  releaseLocalModel,
} from '@/services/localModel';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';

export default function AiModelScreen() {
  const router = useRouter();
  const { setLocalAiReady } = useApp();
  const [downloaded, setDownloaded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sizeMb, setSizeMb] = useState(0);
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const native = isNativeLlamaAvailable();

  const refresh = useCallback(async () => {
    setDownloaded(await isModelDownloaded());
    setSizeMb(await getDownloadedSizeMb());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDownload = async () => {
    setBusy(true);
    setProgress(0);
    try {
      await downloadModel(setProgress);
      await refresh();
      Alert.alert('Done', 'Model downloaded. Tap "Load model" to use offline AI.');
    } catch (error) {
      Alert.alert('Download failed', error instanceof Error ? error.message : 'Try again on Wi-Fi');
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const handleLoad = async () => {
    setBusy(true);
    try {
      await loadLocalModel();
      setLoaded(true);
      setLocalAiReady(true);
      Alert.alert('Ready', 'Offline AI is active in Chat.');
      router.back();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete model', 'Remove downloaded model from device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteLocalModel();
          setLoaded(false);
          setLocalAiReady(false);
          await refresh();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Local AI Model" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Ionicons name="hardware-chip" size={48} color={Colors.primary} />
          <Text style={styles.modelName}>{LOCAL_MODEL.name}</Text>
          <Text style={styles.modelMeta}>
            ~{LOCAL_MODEL.sizeMb} MB · works offline · no API key needed
          </Text>
        </View>

        {!native && (
          <View style={styles.warn}>
            <Ionicons name="warning" size={20} color="#B45309" />
            <Text style={styles.warnText}>
              On-device AI works in installed APK/IPA, not in Expo Go. Build with: npm run
              build:preview
            </Text>
          </View>
        )}

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Downloaded</Text>
          <Text style={styles.statusValue}>
            {downloaded ? `Yes (${sizeMb} MB)` : 'No'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Loaded in memory</Text>
          <Text style={styles.statusValue}>{loaded ? 'Yes' : 'No'}</Text>
        </View>

        {progress !== null && (
          <View style={styles.progressBox}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.progressText}>Downloading… {progress}%</Text>
          </View>
        )}

        {!downloaded && (
          <PrimaryButton
            title={busy ? 'Downloading…' : 'Download model'}
            onPress={handleDownload}
            loading={busy}
            disabled={!native}
          />
        )}

        {downloaded && !loaded && (
          <PrimaryButton
            title="Load model"
            onPress={handleLoad}
            loading={busy}
            style={{ marginTop: Spacing.md }}
          />
        )}

        {downloaded && (
          <PrimaryButton
            title="Delete model"
            onPress={handleDelete}
            style={{ marginTop: Spacing.md, backgroundColor: Colors.textSecondary }}
          />
        )}

        <Text style={styles.hint}>
          After download, Chat uses this model on your phone. Resume analysis still uses cloud
          AI (needs backend or Groq key) for best quality.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  card: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  modelName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginTop: Spacing.md },
  modelMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.sm, textAlign: 'center' },
  warn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: '#FEF3C7',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  warnText: { flex: 1, fontSize: FontSize.sm, color: '#92400E', lineHeight: 20 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  statusValue: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  progressBox: { alignItems: 'center', padding: Spacing.lg, gap: Spacing.sm },
  progressText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 22,
    marginTop: Spacing.xl,
    textAlign: 'center',
  },
});
