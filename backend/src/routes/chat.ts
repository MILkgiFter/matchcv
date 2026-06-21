import { Router } from 'express';
import { z } from 'zod';
import { askText } from '../services/ai.js';
import { chatSystemPrompt } from '../i18n/prompts.js';

export const chatRouter = Router();

chatRouter.post('/', async (req, res, next) => {
  try {
    const body = z
      .object({
        message: z.string().min(1),
        locale: z.string().optional(),
        history: z
          .array(
            z.object({
              role: z.enum(['user', 'assistant']),
              content: z.string(),
            }),
          )
          .optional(),
      })
      .parse(req.body);

    const historyText = (body.history ?? [])
      .slice(-8)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const reply = await askText(
      chatSystemPrompt(body.locale),
      `${historyText ? `History:\n${historyText}\n\n` : ''}User: ${body.message}`,
    );

    res.json({ reply });
  } catch (error) {
    next(error);
  }
});
