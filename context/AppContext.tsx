import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import type {
  AnalysisResult,
  ChatMessage,
  CoverLetterResult,
  MatchResult,
  ResumeFile,
  SavedJob,
} from '@/types/api';
import type { UsageFeature } from '@/constants/limits';
import {
  canUseFeature,
  getUsageCounts,
  incrementUsage,
  type UsageCounts,
} from '@/services/usage';
import { setPremiumStatus } from '@/services/storage';

type AppState = {
  resumeFile: ResumeFile | null;
  analysis: AnalysisResult | null;
  matchResult: MatchResult | null;
  coverLetter: CoverLetterResult | null;
  jobDescription: string;
  chatMessages: ChatMessage[];
  savedJobs: SavedJob[];
  coverLetterCount: number;
  isLoading: boolean;
  error: string | null;
  isPremium: boolean;
  usage: UsageCounts;
  apiOnline: boolean;
  localAiReady: boolean;
};

type AppContextValue = AppState & {
  setResumeFile: (file: ResumeFile | null) => void;
  setAnalysis: (analysis: AnalysisResult | null) => void;
  setMatchResult: (result: MatchResult | null) => void;
  setCoverLetter: (letter: CoverLetterResult | null) => void;
  setJobDescription: (text: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  setSavedJobs: (jobs: SavedJob[]) => void;
  incrementCoverLetters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPremium: (value: boolean) => void;
  refreshUsage: () => Promise<void>;
  recordUsage: (feature: UsageFeature) => Promise<void>;
  canUse: (feature: UsageFeature) => boolean;
  setApiOnline: (online: boolean) => void;
  setLocalAiReady: (ready: boolean) => void;
  clearError: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [resumeFile, setResumeFile] = useState<ResumeFile | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [coverLetter, setCoverLetter] = useState<CoverLetterResult | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [coverLetterCount, setCoverLetterCount] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setPremiumState] = useState(false);
  const [usage, setUsage] = useState<UsageCounts>({
    analysis: 0,
    match: 0,
    coverLetter: 0,
    chatToday: 0,
  });
  const [apiOnline, setApiOnline] = useState(false);
  const [localAiReady, setLocalAiReady] = useState(false);

  const addChatMessage = useCallback((message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message]);
  }, []);

  const incrementCoverLetters = useCallback(() => {
    setCoverLetterCount((c) => c + 1);
  }, []);

  const refreshUsage = useCallback(async () => {
    setUsage(await getUsageCounts());
  }, []);

  const setPremium = useCallback((value: boolean) => {
    setPremiumState(value);
    void setPremiumStatus(value);
  }, []);

  const canUse = useCallback(
    (feature: UsageFeature) => canUseFeature(feature, usage, isPremium),
    [usage, isPremium],
  );

  const recordUsage = useCallback(
    async (feature: UsageFeature) => {
      if (isPremium) return;
      setUsage(await incrementUsage(feature));
    },
    [isPremium],
  );

  useEffect(() => {
    void refreshUsage();
  }, [refreshUsage]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      resumeFile,
      analysis,
      matchResult,
      coverLetter,
      jobDescription,
      chatMessages,
      savedJobs,
      coverLetterCount,
      isLoading,
      error,
      isPremium,
      usage,
      apiOnline,
      localAiReady,
      setResumeFile,
      setAnalysis,
      setMatchResult,
      setCoverLetter,
      setJobDescription,
      addChatMessage,
      setSavedJobs,
      incrementCoverLetters,
      setLoading,
      setError,
      setPremium,
      refreshUsage,
      recordUsage,
      canUse,
      setApiOnline,
      setLocalAiReady,
      clearError,
    }),
    [
      resumeFile,
      analysis,
      matchResult,
      coverLetter,
      jobDescription,
      chatMessages,
      savedJobs,
      coverLetterCount,
      isLoading,
      error,
      isPremium,
      usage,
      apiOnline,
      localAiReady,
      addChatMessage,
      incrementCoverLetters,
      clearError,
      refreshUsage,
      recordUsage,
      canUse,
      setPremium,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
