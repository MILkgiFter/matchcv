export const FREE_LIMITS = {
  resumeAnalysis: 1,
  jobMatch: 1,
  coverLetter: 1,
  chatMessagesPerDay: 5,
  visibleMetrics: 2,
  visibleKeywords: 2,
} as const;

export type UsageFeature = 'analysis' | 'match' | 'coverLetter' | 'chat';

export type PremiumSource =
  | 'analysis'
  | 'match'
  | 'coverLetter'
  | 'chat'
  | 'improve'
  | 'keywords'
  | 'metrics'
  | 'home'
  | 'profile';
