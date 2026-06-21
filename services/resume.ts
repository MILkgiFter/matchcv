import { Platform } from 'react-native';
import { getAppLocale } from '@/i18n';
import { api } from '@/services/api';
import type { AnalysisResult, MatchResult, ResumeFile } from '@/types/api';

export async function analyzeResume(file: ResumeFile): Promise<AnalysisResult> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    const typedBlob =
      file.mimeType && blob.type !== file.mimeType
        ? new Blob([blob], { type: file.mimeType })
        : blob;
    formData.append('resume', typedBlob, file.name);
  } else {
    formData.append('resume', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    } as unknown as Blob);
  }

  formData.append('locale', getAppLocale());
  return api.upload<AnalysisResult>('/api/resume/analyze', formData);
}

export async function matchJob(
  jobDescription: string,
  resumeText?: string,
): Promise<MatchResult> {
  return api.request<MatchResult>('/api/resume/match', {
    method: 'POST',
    body: JSON.stringify({ jobDescription, resumeText, locale: getAppLocale() }),
  });
}
