import { Router } from 'express';
import { z } from 'zod';
import { askText } from '../services/ai.js';
import { coverLetterPrompt } from '../i18n/prompts.js';

export const coverLetterRouter = Router();

coverLetterRouter.post('/', async (req, res, next) => {
  try {
    const body = z
      .object({
        tone: z.enum(['Formal', 'Friendly', 'Confident']),
        jobDescription: z.string().optional(),
        resumeText: z.string().optional(),
        locale: z.string().optional(),
      })
      .parse(req.body);

    const letter = await askText(
      coverLetterPrompt(body.tone, body.locale),
      `Job description:\n${body.jobDescription ?? 'General application'}\n\nResume:\n${body.resumeText ?? 'Candidate with relevant experience'}`,
    );

    res.json({ letter, tone: body.tone });
  } catch (error) {
    next(error);
  }
});
