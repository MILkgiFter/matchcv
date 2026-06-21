import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedJob } from '@/types/api';

const JOBS_KEY = 'saved_jobs';

export async function getSavedJobs(): Promise<SavedJob[]> {
  const raw = await AsyncStorage.getItem(JOBS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as SavedJob[];
}

export async function saveJob(job: SavedJob): Promise<void> {
  const jobs = await getSavedJobs();
  const filtered = jobs.filter((j) => j.id !== job.id);
  await AsyncStorage.setItem(JOBS_KEY, JSON.stringify([job, ...filtered].slice(0, 20)));
}

export function extractJobTitle(description: string): string {
  const line = description.split('\n').find((l) => l.trim().length > 0)?.trim() ?? '';
  return line.length > 60 ? `${line.slice(0, 57)}...` : line || 'Job match';
}
