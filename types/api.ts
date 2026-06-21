export type ResumeMetric = {
  label: string;
  score: number;
  good: boolean;
};

export type AnalysisResult = {
  score: number;
  status: string;
  metrics: ResumeMetric[];
};

export type MatchResult = {
  matchPercent: number;
  status: string;
  missingKeywords: string[];
  jobTitle?: string;
};

export type SavedJob = {
  id: string;
  title: string;
  description: string;
  matchPercent: number;
  createdAt: number;
};

export type CoverLetterTone = 'Formal' | 'Friendly' | 'Confident';

export type CoverLetterResult = {
  letter: string;
  tone: CoverLetterTone;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};

export type ResumeFile = {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
};

export type ApiError = {
  message: string;
  code?: string;
};

export type AiStatus = {
  configured: boolean;
  provider: string | null;
  model: string | null;
};
