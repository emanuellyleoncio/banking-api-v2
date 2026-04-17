import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export default prisma;
