import { config } from 'dotenv';
config({ path: '.env.test', override: true });

import { execSync } from 'child_process';
import prisma from '../src/lib/prisma';


beforeAll(async () => {
  execSync('./node_modules/.bin/prisma migrate deploy', {
    env: { ...process.env },
    stdio: 'inherit',
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

afterAll(async () => {
  await prisma.$disconnect();
});
