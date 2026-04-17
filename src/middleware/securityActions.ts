import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { Express } from 'express';

const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

export function setupSecurity(app: Express) {
  app.use(helmet());
  app.use('/api', defaultLimiter);
  app.use('/api/auth', authLimiter);
}
