import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors';
import { env } from '../lib/env';


const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.query as { password?: string };

  if (!password)
    return next(new ForbiddenError('Password was not informed.'));

  if (password !== env.BANK_ADMIN_PASSWORD)
    return next(new ForbiddenError('Invalid password.'));

  next();
};

export default adminAuth;
