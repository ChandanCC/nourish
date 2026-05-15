import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import logsRouter from './routes/logs';
import authRouter from './routes/auth';
import analyseRouter from './routes/analyse';
import homeRouter from './routes/home';
import signalRouter from './routes/signal';
import userRouter from './routes/user';
import trainingRouter from './routes/training';
import intelRouter from './routes/intel';
import { requireAuth } from './middleware/auth';
import { requestLogger } from './middleware/requestLogger';

const analyseLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.userId ?? req.ip ?? 'unknown',
  handler: (_req, res) => res.status(429).json({ error: 'rate_limit', retryAfter: 60 }),
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
});

const app = express();

app.disable('x-powered-by');
app.use(helmet({
  hsts: process.env.NODE_ENV === 'production'
    ? { maxAge: 31536000, includeSubDomains: true }
    : false,
  contentSecurityPolicy: {
    directives: { defaultSrc: ["'self'"] },
  },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
}));
app.use(requestLogger);
app.use(morgan('combined'));
app.use(express.json({ limit: '2mb' }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
app.use('/auth', authRouter);
app.use('/api/logs', requireAuth, logsRouter);
app.use('/api/home', requireAuth, homeRouter);
app.use('/api/signal', requireAuth, signalRouter);
app.use('/api/analyse', requireAuth, analyseLimiter, analyseRouter);
app.use('/api/user', requireAuth, userRouter);
app.use('/api/training', requireAuth, trainingRouter);
app.use('/api/intel', requireAuth, intelRouter);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

export default app;
