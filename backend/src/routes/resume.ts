import { Router } from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { z } from 'zod';
import { askJson } from '../services/ai.js';
import { jobMatchPrompt, resumeAnalyzePrompt } from '../i18n/prompts.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const resumeRouter = Router();

function normalizeScore(value: number): number {
  if (value <= 1) return Math.round(value * 100);
  return Math.round(Math.min(100, Math.max(0, value)));
}

async function extractText(file: Express.Multer.File): Promise<string> {
  const name = file.originalname.toLowerCase();
  const mime = file.mimetype.toLowerCase();
  const isPdf = mime === 'application/pdf' || name.endsWith('.pdf');
  const isDocx =
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx');
  const isText = mime === 'text/plain' || name.endsWith('.txt');

  if (isPdf) {
    try {
      const data = await pdfParse(file.buffer);
      return data.text;
    } catch {
      throw new Error('Invalid or corrupted PDF file.');
    }
  }

  if (isDocx) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  if (isText) {
    return file.buffer.toString('utf-8');
  }

  throw new Error('Unsupported file type. Use PDF, DOCX, or TXT.');
}

resumeRouter.post('/analyze', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Resume file is required' });
      return;
    }

    const text = (await extractText(req.file)).trim();
    if (text.length < 50) {
      res.status(400).json({
        message:
          'Could not extract enough text from the file. Use a text-based PDF (not a scanned image).',
      });
      return;
    }

    const locale = typeof req.body?.locale === 'string' ? req.body.locale : req.headers['accept-language'];

    const raw = await askJson<{
      score: number;
      status: string;
      metrics: { label: string; score: number; good: boolean }[];
    }>(
      resumeAnalyzePrompt(locale),
      text.slice(0, 8000),
    );

    const result = {
      ...raw,
      score: normalizeScore(raw.score),
      metrics: raw.metrics.map((m) => ({
        ...m,
        score: normalizeScore(m.score),
      })),
    };

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    console.error(JSON.stringify({ level: 'error', path: 'analyze', message }));
    res.status(502).json({ message: `AI error: ${message}` });
  }
});

resumeRouter.post('/match', async (req, res, next) => {
  try {
    const body = z
      .object({
        jobDescription: z.string().min(20),
        resumeText: z.string().optional(),
        locale: z.string().optional(),
      })
      .parse(req.body);

    const result = await askJson<{
      matchPercent: number;
      status: string;
      missingKeywords: string[];
      jobTitle: string;
    }>(
      jobMatchPrompt(body.locale),
      `Job:\n${body.jobDescription}\n\nResume:\n${body.resumeText ?? 'Not provided'}`,
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});
