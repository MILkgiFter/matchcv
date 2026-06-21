import type { Request, Response, NextFunction } from 'express';

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') {
    next();
    return;
  }

  const expected = process.env.API_KEY;
  if (!expected) {
    next();
    return;
  }

  const provided = req.header('X-API-Key');
  if (provided !== expected) {
    res.status(401).json({ message: 'Invalid API key' });
    return;
  }

  next();
}
