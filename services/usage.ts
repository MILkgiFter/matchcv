import AsyncStorage from '@react-native-async-storage/async-storage';
import { FREE_LIMITS, type UsageFeature } from '@/constants/limits';

const KEYS = {
  analysis: 'usage_analysis',
  match: 'usage_match',
  coverLetter: 'usage_cover_letter',
  chatDate: 'usage_chat_date',
  chatCount: 'usage_chat_count',
} as const;

export type UsageCounts = {
  analysis: number;
  match: number;
  coverLetter: number;
  chatToday: number;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getUsageCounts(): Promise<UsageCounts> {
  const [analysis, match, coverLetter, chatDate, chatCount] = await Promise.all([
    AsyncStorage.getItem(KEYS.analysis),
    AsyncStorage.getItem(KEYS.match),
    AsyncStorage.getItem(KEYS.coverLetter),
    AsyncStorage.getItem(KEYS.chatDate),
    AsyncStorage.getItem(KEYS.chatCount),
  ]);

  const today = todayKey();
  const chatToday = chatDate === today ? Number(chatCount ?? 0) : 0;

  return {
    analysis: Number(analysis ?? 0),
    match: Number(match ?? 0),
    coverLetter: Number(coverLetter ?? 0),
    chatToday,
  };
}

export async function incrementUsage(feature: UsageFeature): Promise<UsageCounts> {
  const counts = await getUsageCounts();

  if (feature === 'chat') {
    const today = todayKey();
    const storedDate = await AsyncStorage.getItem(KEYS.chatDate);
    const next =
      storedDate === today ? counts.chatToday + 1 : 1;
    await AsyncStorage.multiSet([
      [KEYS.chatDate, today],
      [KEYS.chatCount, String(next)],
    ]);
    return { ...counts, chatToday: next };
  }

  const key = KEYS[feature];
  const next = counts[feature] + 1;
  await AsyncStorage.setItem(key, String(next));
  return { ...counts, [feature]: next };
}

export function canUseFeature(
  feature: UsageFeature,
  counts: UsageCounts,
  isPremium: boolean,
): boolean {
  if (isPremium) return true;

  switch (feature) {
    case 'analysis':
      return counts.analysis < FREE_LIMITS.resumeAnalysis;
    case 'match':
      return counts.match < FREE_LIMITS.jobMatch;
    case 'coverLetter':
      return counts.coverLetter < FREE_LIMITS.coverLetter;
    case 'chat':
      return counts.chatToday < FREE_LIMITS.chatMessagesPerDay;
    default:
      return false;
  }
}

export function remainingFree(feature: UsageFeature, counts: UsageCounts, isPremium: boolean): number {
  if (isPremium) return Infinity;
  switch (feature) {
    case 'analysis':
      return Math.max(0, FREE_LIMITS.resumeAnalysis - counts.analysis);
    case 'match':
      return Math.max(0, FREE_LIMITS.jobMatch - counts.match);
    case 'coverLetter':
      return Math.max(0, FREE_LIMITS.coverLetter - counts.coverLetter);
    case 'chat':
      return Math.max(0, FREE_LIMITS.chatMessagesPerDay - counts.chatToday);
    default:
      return 0;
  }
}
