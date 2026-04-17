import { trace, SpanStatusCode } from '@opentelemetry/api';
const tracer = trace.getTracer('bank-system-api');

import type z from 'zod';
import { registerSchema, loginSchema } from '../schemas/index';
import prisma from '../lib/prisma';
import { ConflictError, ForbiddenError, NotFoundError } from '../errors';
import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { withSpan } from '../lib/tracing';
import { env } from '../lib/env';

type RegisterData = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

async function nextAccountNumber(): Promise<number> {
    const last = await prisma.account.findFirst({ orderBy: { number: 'desc' } });
    return last ? last.number + 1 : 1001;
}

export const authService = {
  register: async (data: RegisterData) => {
    return withSpan('authService.register', async () => {
      const existAccount = await prisma.account.findFirst({
        where: { OR: [{ document: data.document }, { email: data.email }] },
      });

      if (existAccount) {
        throw new ConflictError('Account with this document or email already exists.');
      }

      const passwordHash = await bcrypt.hash(data.password, 10);

      const account = await prisma.account.create({
        data: {
          name: data.name,
          document: data.document,
          birthDate: data.birth_date,
          phone: data.phone ?? null,
          email: data.email,
          password: passwordHash,
        } as any,
        select: { id: true, number: true, name: true, email: true },
      });

      const secret = env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET is not defined.');

      const token = jwt.sign(
        { id: account.id, number: account.number },
        secret,
        { expiresIn: env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions
      );

      return { account, token };
    });
  },

  login: async (data: LoginInput) => {
    return withSpan('authService.login', async () => {
      const account = await prisma.account.findUnique({ where: { email: data.email } });
      if (!account) throw new NotFoundError('Account not found.');

      const valid = await bcrypt.compare(data.password, account.password);
      if (!valid) throw new ForbiddenError('Invalid credentials.');

      const secret = env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET is not defined.');

      const token = jwt.sign(
        { id: account.id, number: account.number },
        secret,
        { expiresIn: env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions
      );

      return { token };
    });
  },
};
