import { config } from 'dotenv';
config({ path: '.env.test', override: true });

import { execSync } from 'child_process';
import prisma from '../src/lib/prisma';
import { env } from '../src/lib/env';


beforeAll(async () => {
  execSync('npx prisma migrate deploy', {
    env: { ...env, DATABASE_URL: env.DATABASE_URL },
  });
});

afterEach(async () => {
  await prisma.transfer.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.account.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
