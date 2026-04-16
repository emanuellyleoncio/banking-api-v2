import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ForbiddenError, UnauthorizedError, ValidationError } from '../errors';

export interface TokenPayload {
    id: number;
    number: number;
}

declare global {
    namespace Express {
        interface Request {
            account: TokenPayload;
        }
    }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return next(new UnauthorizedError('Token not provided.'));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return next(new ValidationError('Token was not informed.'));
    }


    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as unknown as TokenPayload;
        req.account = payload;
        next();
    } catch {
        return next(new ForbiddenError('Invalid or expired token.'));
    }
};

export default authMiddleware;
