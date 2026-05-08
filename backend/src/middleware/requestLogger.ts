import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = randomUUID();
  const startTime = Date.now();
  res.locals['requestId'] = requestId;
  res.locals['startTime'] = startTime;

  res.on('finish', () => {
    const log: Record<string, unknown> = {
      level: res.statusCode >= 500 ? 'error' : 'info',
      requestId,
      method: req.method,
      path: req.path,
      userId: req.user?.userId ?? null,
      statusCode: res.statusCode,
      durationMs: Date.now() - startTime,
      ts: new Date().toISOString(),
    };
    process.stdout.write(JSON.stringify(log) + '\n');
  });

  next();
}
