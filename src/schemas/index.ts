import { TransferType } from '@prisma/client';
import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters.'),
  document: z.string().regex(/^\d{11}$/, 'Document must contain exactly 11 digits.'),
  birth_date: z.coerce.date({ error: 'Invalid birth date.' }),
  phone: z.string().regex(/^\d{10,11}$/, 'Phone must contain 10 or 11 digits.').optional(),
  email: z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Invalid email address")),
  password: z.string().min(6, 'Password must have at least 6 characters.'),
});

export const accountQuerySchema = z.object({
  account_number: z.coerce.number().int().positive('Invalid account number.'),
  password: z.string().min(1, 'Password is required.'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters.'),
  document: z.string().regex(/^\d{11}$/, 'Document must contain exactly 11 digits.'),
  birth_date: z.coerce.date({ error: 'Invalid birth date.' }),
  phone: z.string().regex(/^\d{10,11}$/, 'Phone must contain 10 or 11 digits.').optional(),
  email: z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Invalid email address")),
  password: z.string().min(6, 'Password must have at least 6 characters.'),
});

export const loginSchema = z.object({
  email: z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Invalid email address")),
  password: z.string().min(1, 'Password is required.'),
});

export const depositSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than zero.'),
});

export const withdrawalSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than zero.'),
});

export const transferSchema = z.object({
  destination_account: z.coerce.number().int().positive('Invalid destination account number.'),
  amount: z.coerce.number().positive('Amount must be greater than zero.'),
  type: z.nativeEnum(TransferType).default(TransferType.PIX),
});

export const updateAccountSchema = registerSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided.' }
);
