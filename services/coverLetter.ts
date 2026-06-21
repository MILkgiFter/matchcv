import { getAppLocale } from '@/i18n';
import { api } from '@/services/api';
import type { CoverLetterResult, CoverLetterTone } from '@/types/api';

export async function generateCoverLetter(
  tone: CoverLetterTone,
  jobDescription?: string,
  resumeText?: string,
): Promise<CoverLetterResult> {
  return api.request<CoverLetterResult>('/api/cover-letter', {
    method: 'POST',
    body: JSON.stringify({ tone, jobDescription, resumeText, locale: getAppLocale() }),
  });
}
