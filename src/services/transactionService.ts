import type { TransferType } from "@prisma/client";
import prisma from "../lib/prisma";
import { NotFoundError, UnprocessableError } from "../errors";
import type { depositSchema, transferSchema, withdrawalSchema } from "../schemas";
import type z from "zod";
import { withSpan } from "../lib/tracing";

type DepositInput = z.infer<typeof depositSchema>;
type WithdrawalInput = z.infer<typeof withdrawalSchema>;
type TransferInput = z.infer<typeof transferSchema>;

const toCents = (amount: number) => Math.round(amount * 100);
const toReais = (amount: number) => amount / 100;

async function findAccount(accountId: string) {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) throw new NotFoundError('Account not found.');
  return account;
}

export const transactionService = {
  deposit: async (accountId: string, data: DepositInput) => {
    return withSpan('transactionService.deposit', async () => {
      const account = await findAccount(accountId);
      const cents = toCents(data.amount);

      const [, deposit] = await prisma.$transaction([
        prisma.account.update({
          where: { id: account.id },
          data: { balance: { increment: cents } },
        }),
        prisma.deposit.create({
          data: { accountId: account.id, amount: cents },
        }),
      ]);

      return { deposit_id: deposit.id, amount: toReais(deposit.amount), created_at: deposit.createdAt };
    });
  },

  withdraw: async (accountId: string, data: WithdrawalInput) => {
    return withSpan('transactionService.withdraw', async () => {
      const account = await findAccount(accountId);
      const cents = toCents(data.amount);

      if (account.balance < cents) throw new UnprocessableError('Insufficient balance.');

      const [, withdrawal] = await prisma.$transaction([
        prisma.account.update({
          where: { id: account.id },
          data: { balance: { decrement: cents } },
        }),
        prisma.withdrawal.create({
          data: { accountId: account.id, amount: cents },
        }),
      ]);

      return { withdrawal_id: withdrawal.id, amount: toReais(withdrawal.amount), created_at: withdrawal.createdAt };
    });
  },

  transfer: async (accountId: string, data: TransferInput) => {
    return withSpan('transactionService.transfer', async () => {
      const origin = await findAccount(accountId);
      const destination = await prisma.account.findUnique({ where: { number: data.destination_account } });

      if (!destination) throw new NotFoundError('Destination account not found.');
      if (origin.id === destination.id) throw new UnprocessableError('Cannot transfer to the same account.');

      const cents = toCents(data.amount);
      if (origin.balance < cents) throw new UnprocessableError('Insufficient balance.');

      const [, , transfer] = await prisma.$transaction([
        prisma.account.update({
          where: { id: origin.id },
          data: { balance: { decrement: cents } },
        }),
        prisma.account.update({
          where: { id: destination.id },
          data: { balance: { increment: cents } },
        }),
        prisma.transfer.create({
          data: {
            originId: origin.id,
            destinationId: destination.id,
            amount: cents,
            type: data.type as TransferType,
          },
        }),
      ]);

      return {
        transfer_id: transfer.id,
        amount: toReais(transfer.amount),
        type: transfer.type,
        created_at: transfer.createdAt,
      };
    });
  },

  balance: async (accountId: string) => {
    return withSpan('transactionService.balance', async () => {
      const account = await findAccount(accountId);
      return { balance: toReais(account.balance) };
    });
  },

  statement: async (accountId: string) => {
    return withSpan('transactionService.statement', async () => {
      const account = await findAccount(accountId);

      const [deposits, withdrawals, sent, received] = await Promise.all([
        prisma.deposit.findMany({ where: { accountId: account.id }, orderBy: { createdAt: 'desc' } }),
        prisma.withdrawal.findMany({ where: { accountId: account.id }, orderBy: { createdAt: 'desc' } }),
        prisma.transfer.findMany({ where: { originId: account.id }, orderBy: { createdAt: 'desc' } }),
        prisma.transfer.findMany({ where: { destinationId: account.id }, orderBy: { createdAt: 'desc' } }),
      ]);

      const fmt = (list: { amount: number;[key: string]: unknown }[]) =>
        list.map(({ amount, ...rest }) => ({ ...rest, amount: toReais(amount) }));

      return {
        deposits: fmt(deposits),
        withdrawals: fmt(withdrawals),
        transfers_sent: fmt(sent),
        transfers_received: fmt(received),
      };
    });
  },
};
