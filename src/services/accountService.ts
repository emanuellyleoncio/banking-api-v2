import type z from "zod";
import { ConflictError, NotFoundError, UnprocessableError } from "../errors";
import prisma from "../lib/prisma";
import type { updateAccountSchema } from "../schemas";
import bcrypt from "bcryptjs";
import { withSpan } from "../lib/tracing";

type UpdateInput = z.infer<typeof updateAccountSchema>;

export const accountService = {
    list: async () => {
        return withSpan('accountService.list', async () => {
            return prisma.account.findMany({
                select: {
                    number: true,
                    name: true,
                    email: true,
                    phone: true,
                    document: true,
                    birthDate: true,
                    balance: true,
                    createdAt: true,
                },
                orderBy: { number: 'asc' },
            });
        })
    },
    update: async (accountId: number, data: UpdateInput) => {
        return withSpan('accountService.update', async () => {
            const account = await prisma.account.findUnique({ where: { id: accountId } });
            if (!account) {
                throw new NotFoundError('Account not found.');
            }

            if (data.email && data.email !== account.email) {
                const taken = await prisma.account.findUnique({ where: { email: data.email } });
                if (taken) {
                    throw new ConflictError('Email already in use.');
                }
            }

            if (data.document && data.document !== account.document) {
                const taken = await prisma.account.findUnique({ where: { document: data.document } });
                if (taken) {
                    throw new ConflictError('Document already in use.');
                }
            }

            const updateData: Record<string, unknown> = { ...data };

            if (data.password) {
                updateData.password = await bcrypt.hash(data.password, 10);
            }

            if (data.birth_date) {
                updateData.birthDate = data.birth_date;
                delete updateData.birth_date;
            }

            return prisma.account.update({
                where: { id: accountId },
                data: updateData,
                select: { number: true, name: true, email: true, phone: true, updatedAt: true },
            });
        })
    },
    remove: async (accountId: number) => {
        return withSpan('accountService.remove', async () => {
            const account = await prisma.account.findUnique({ where: { id: accountId } });
            if (!account) {
                throw new NotFoundError('Account not found.');
            }
            if (account.balance !== 0) {
                throw new UnprocessableError('Account must have zero balance before deletion.');
            }

            await prisma.account.delete({ where: { id: accountId } });
        })
    },
};
