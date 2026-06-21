import 'dotenv/config';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { getAiStatus } from './services/ai.js';
import { apiKeyAuth } from './middleware/auth.js';
import { requestLogger } from './middleware/logger.js';
import { chatRouter } from './routes/chat.js';
import { coverLetterRouter } from './routes/coverLetter.js';
import { resumeRouter } from './routes/resume.js';

const app = express();
const port = Number(process.env.PORT ?? 3001);

function corsOrigin(): boolean | string | string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw || raw === '*') {
    return true;
  }
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
}

app.set('trust proxy', 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(compression());
app.use(requestLogger);
app.use(
  cors({
    origin: corsOrigin(),
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX ?? 100),
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/health', (_req, res) => {
  const ai = getAiStatus();
  res.json({
    status: 'ok',
    ai,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiKeyAuth);
app.use('/api/resume', resumeRouter);
app.use('/api/chat', chatRouter);
app.use('/api/cover-letter', coverLetterRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(JSON.stringify({ level: 'error', message: err.message, stack: err.stack }));
    res.status(500).json({ message: err.message || 'Internal server error' });
  },
);

const server = app.listen(port, () => {
  console.log(JSON.stringify({ level: 'info', message: `API listening on port ${port}` }));
});

const shutdown = (signal: string) => {
  console.log(JSON.stringify({ level: 'info', message: `${signal} received, shutting down` }));
  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
