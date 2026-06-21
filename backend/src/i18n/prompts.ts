const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  'pt-BR': 'Brazilian Portuguese',
  es: 'Spanish',
  pl: 'Polish',
  de: 'German',
  fr: 'French',
  tr: 'Turkish',
};

export function resolveApiLocale(locale?: string | null): string {
  if (!locale) return 'en';
  const normalized = locale.toLowerCase();
  if (normalized.startsWith('pt')) return 'pt-BR';
  if (normalized.startsWith('es')) return 'es';
  if (normalized.startsWith('pl')) return 'pl';
  if (normalized.startsWith('de')) return 'de';
  if (normalized.startsWith('fr')) return 'fr';
  if (normalized.startsWith('tr')) return 'tr';
  return 'en';
}

export function languageInstruction(locale?: string | null): string {
  const code = resolveApiLocale(locale);
  if (code === 'en') {
    return 'Respond in English.';
  }
  const name = LOCALE_NAMES[code] ?? 'English';
  return `Respond in ${name}. All user-facing text, labels, status messages, and advice must be in ${name}.`;
}

export function chatSystemPrompt(locale?: string | null): string {
  return `You are MatchCV Coach — an expert in resumes, ATS optimization, job matching, interviews, and salary negotiation. Be concise and actionable. ${languageInstruction(locale)}`;
}

export function resumeAnalyzePrompt(locale?: string | null): string {
  return `You are an ATS resume expert. Analyze the resume and return JSON with this exact shape:
{ "score": number, "status": string, "metrics": [{ "label": string, "score": number, "good": boolean }] }
score and metric scores must be integers from 0 to 100 (not decimals like 0.85).
Include exactly these metrics: Skills, Keywords, Summary, Formatting, ATS Compatibility.
Metric labels and status text must be in the user's language. ${languageInstruction(locale)}`;
}

export function jobMatchPrompt(locale?: string | null): string {
  return `Compare resume with job description. Return JSON:
{ "matchPercent": number, "status": string, "missingKeywords": string[], "jobTitle": string }
Status and keywords should be in the user's language. ${languageInstruction(locale)}`;
}

export function coverLetterPrompt(tone: string, locale?: string | null): string {
  return `Write a professional cover letter in a ${tone.toLowerCase()} tone. Return only the letter text. ${languageInstruction(locale)}`;
}
