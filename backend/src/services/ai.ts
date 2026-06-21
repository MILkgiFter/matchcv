import OpenAI from 'openai';

type Provider = 'groq' | 'openai';

function getProvider(): Provider {
  const p = process.env.AI_PROVIDER?.toLowerCase();
  if (p === 'openai') return 'openai';
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.OPENAI_API_KEY) return 'openai';
  throw new Error(
    'No AI configured. Set GROQ_API_KEY (free at console.groq.com) or OPENAI_API_KEY in backend/.env',
  );
}

function getModel(provider: Provider): string {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;
  return provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
}

let client: OpenAI | null = null;
let activeProvider: Provider | null = null;

function getClient(): OpenAI {
  const provider = getProvider();
  if (client && activeProvider === provider) return client;

  if (provider === 'groq') {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  } else {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  activeProvider = provider;
  return client;
}

export function getAiStatus() {
  try {
    const provider = getProvider();
    return { configured: true, provider, model: getModel(provider) };
  } catch {
    return { configured: false, provider: null, model: null };
  }
}

function tryParseJson<T>(content: string): T {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error('AI returned invalid JSON');
  }
}

export async function askJson<T>(system: string, user: string): Promise<T> {
  const provider = getProvider();
  const openai = getClient();
  const model = getModel(provider);
  const systemPrompt = `${system.trim()}\nReturn ONLY a valid JSON object. No markdown fences, no extra text.`;

  const call = async (useJsonMode: boolean) => {
    const response = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      ...(useJsonMode ? { response_format: { type: 'json_object' as const } } : {}),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: user },
      ],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');
    return tryParseJson<T>(content);
  };

  const isJsonModeError = (error: unknown): boolean => {
    const message = error instanceof Error ? error.message : String(error);
    return (
      message.includes('Failed to generate JSON') ||
      message.includes('json_validate_failed')
    );
  };

  // Groq strict JSON mode is unreliable — use plain prompt parsing.
  if (provider === 'groq') {
    return call(false);
  }

  try {
    return await call(true);
  } catch (error) {
    if (!isJsonModeError(error)) throw error;
    return call(false);
  }
}

export async function askText(system: string, user: string): Promise<string> {
  const provider = getProvider();
  const openai = getClient();
  const response = await openai.chat.completions.create({
    model: getModel(provider),
    temperature: 0.5,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });

  return response.choices[0]?.message?.content ?? '';
}
