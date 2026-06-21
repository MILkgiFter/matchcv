import { env } from '@/config/env';
import type { AiStatus } from '@/types/api';

type HealthResponse = {
  status: string;
  ai: AiStatus;
};

export async function checkApiHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${env.apiUrl}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!response.ok) return false;

    const data = (await response.json()) as HealthResponse;
    return data.status === 'ok' && data.ai?.configured === true;
  } catch {
    return false;
  }
}

export async function fetchAiStatus(): Promise<AiStatus | null> {
  try {
    const response = await fetch(`${env.apiUrl}/health`);
    if (!response.ok) return null;
    const data = (await response.json()) as HealthResponse;
    return data.ai;
  } catch {
    return null;
  }
}
