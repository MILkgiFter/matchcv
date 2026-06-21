import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { LOCAL_MODEL } from '@/constants/model';
import type { ChatMessage } from '@/types/api';

const DOWNLOADED_KEY = 'local_model_downloaded';

type LlamaModule = {
  initLlama: (params: {
    model: string;
    n_ctx?: number;
    n_threads?: number;
    n_gpu_layers?: number;
  }) => Promise<LlamaContext>;
};

type LlamaContext = {
  completion: (params: {
    messages?: { role: string; content: string }[];
    prompt?: string;
    n_predict?: number;
    temperature?: number;
    stop?: string[];
  }) => Promise<{ text: string }>;
  release: () => Promise<void>;
};

let llamaContext: LlamaContext | null = null;
let nativeAvailable: boolean | null = null;

function getLlamaModule(): LlamaModule | null {
  try {
    return require('llama.rn') as LlamaModule;
  } catch {
    return null;
  }
}

export function isNativeLlamaAvailable(): boolean {
  if (nativeAvailable !== null) return nativeAvailable;
  nativeAvailable = getLlamaModule() !== null;
  return nativeAvailable;
}

function modelDirectory(): string {
  return `${FileSystem.documentDirectory}models/`;
}

export function getModelPath(): string {
  return `${modelDirectory()}${LOCAL_MODEL.filename}`;
}

export async function isModelDownloaded(): Promise<boolean> {
  const flag = await AsyncStorage.getItem(DOWNLOADED_KEY);
  if (flag !== 'true') return false;
  const info = await FileSystem.getInfoAsync(getModelPath());
  return info.exists && (info.size ?? 0) > 10_000_000;
}

export async function isLocalModelReady(): Promise<boolean> {
  return llamaContext !== null;
}

export async function getDownloadedSizeMb(): Promise<number> {
  const info = await FileSystem.getInfoAsync(getModelPath());
  if (!info.exists || !info.size) return 0;
  return Math.round(info.size / 1024 / 1024);
}

export async function downloadModel(
  onProgress?: (percent: number) => void,
): Promise<void> {
  const dir = modelDirectory();
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const download = FileSystem.createDownloadResumable(
    LOCAL_MODEL.url,
    getModelPath(),
    {},
    (progress) => {
      const total = progress.totalBytesExpectedToWrite;
      const done = progress.totalBytesWritten;
      if (total > 0) {
        onProgress?.(Math.round((done / total) * 100));
      }
    },
  );

  const result = await download.downloadAsync();
  if (!result?.uri) {
    throw new Error('Download failed');
  }

  await AsyncStorage.setItem(DOWNLOADED_KEY, 'true');
}

export async function loadLocalModel(): Promise<void> {
  if (llamaContext) return;

  const llama = getLlamaModule();
  if (!llama) {
    throw new Error(
      'On-device AI requires a native build. Run: npm run build:preview (not Expo Go).',
    );
  }

  if (!(await isModelDownloaded())) {
    throw new Error('Model not downloaded');
  }

  llamaContext = await llama.initLlama({
    model: getModelPath(),
    n_ctx: 2048,
    n_threads: Platform.OS === 'ios' ? 4 : 4,
    n_gpu_layers: Platform.OS === 'ios' ? 99 : 0,
  });
}

export async function releaseLocalModel(): Promise<void> {
  if (llamaContext) {
    await llamaContext.release();
    llamaContext = null;
  }
}

export async function deleteLocalModel(): Promise<void> {
  await releaseLocalModel();
  const info = await FileSystem.getInfoAsync(getModelPath());
  if (info.exists) {
    await FileSystem.deleteAsync(getModelPath(), { idempotent: true });
  }
  await AsyncStorage.removeItem(DOWNLOADED_KEY);
}

export async function localChatComplete(
  message: string,
  history: ChatMessage[],
): Promise<string> {
  if (!llamaContext) {
    await loadLocalModel();
  }

  if (!llamaContext) {
    throw new Error('Model not loaded');
  }

  const messages = [
    { role: 'system', content: 'You are MatchCV Coach. Help with resumes, job search, and interviews. Be concise and practical.' },
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  const result = await llamaContext.completion({
    messages,
    n_predict: 400,
    temperature: 0.7,
    stop: ['<|endoftext|>', '</s>', '<|end|>'],
  });

  return result.text.trim();
}
