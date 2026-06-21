import { env } from '@/config/env';
import { getAppLocale } from '@/i18n';
import type { ApiError } from '@/types/api';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.apiUrl.replace(/\/$/, '');
  }

  private headers(isMultipart = false): HeadersInit {
    const headers: HeadersInit = {};
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    if (env.apiKey) {
      headers['X-API-Key'] = env.apiKey;
    }
    headers['Accept-Language'] = getAppLocale();
    return headers;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.headers(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as ApiError;
        throw new Error(error.message ?? `Request failed: ${response.status}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  async upload<T>(path: string, formData: FormData): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers(true),
      body: formData,
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as ApiError;
      throw new Error(error.message ?? `Upload failed: ${response.status}`);
    }

    return (await response.json()) as T;
  }
}

export const api = new ApiClient();
