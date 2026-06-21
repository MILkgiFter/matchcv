import { getAppLocale } from '@/i18n';
import { api } from '@/services/api';
import {
  isLocalModelReady,
  isModelDownloaded,
  loadLocalModel,
  localChatComplete,
} from '@/services/localModel';
import type { ChatMessage } from '@/types/api';

type ChatResponse = { reply: string };

export type ChatSource = 'local' | 'cloud';

export async function getChatSource(): Promise<ChatSource | null> {
  if (await isLocalModelReady()) return 'local';
  if (await isModelDownloaded()) return 'local';
  return 'cloud';
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
): Promise<{ reply: string; source: ChatSource }> {
  const downloaded = await isModelDownloaded();

  if (downloaded) {
    try {
      if (!(await isLocalModelReady())) {
        await loadLocalModel();
      }
      const reply = await localChatComplete(message, history);
      return { reply, source: 'local' };
    } catch (error) {
      console.warn('Local AI failed, trying cloud:', error);
    }
  }

  const data = await api.request<ChatResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      history: history.map(({ role, content }) => ({ role, content })),
      locale: getAppLocale(),
    }),
  });

  return { reply: data.reply, source: 'cloud' };
}
