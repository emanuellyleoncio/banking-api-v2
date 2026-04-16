import "dotenv/config";
import { faker } from '@faker-js/faker/locale/pt_BR';
import { PrismaClient, TransferType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

async function main() {
  console.log('Clean up da base de dados...');
  await prisma.transfer.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.account.deleteMany();

  console.log('Criando contas de teste...');

  const adminAccount = await prisma.account.create({
    data: {
      number: 1001,
      balance: 500000, // R$ 5.000,00
      name: 'Admin User',
      document: '12345678901',
      birthDate: new Date('1990-01-01'),
      email: 'admin@bank.com',
      password: 'hash_super_segura_aqui',
      phone: '11999999999',
    },
  });

  const accounts = [];
  for (let i = 0; i < 5; i++) {
    const account = await prisma.account.create({
      data: {
        number: 2000 + i,
        balance: faker.number.int({ min: 1000, max: 100000 }),
        name: faker.person.fullName(),
        document: faker.helpers.replaceSymbols('###########'),
        birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        email: faker.internet.email(),
        password: 'hash_aleatoria',
        phone: faker.phone.number(),
      },
    });
    accounts.push(account);
  }

  console.log('Gerando histórico de transações...');

  // 3. Criar Depósitos e Saques para a conta Admin
  await prisma.deposit.createMany({
    data: [
      { amount: 10000, accountId: adminAccount.id },
      { amount: 25000, accountId: adminAccount.id },
    ],
  });

  await prisma.withdrawal.createMany({
    data: [
      { amount: 5000, accountId: adminAccount.id },
    ],
  });

  // 4. Criar Transferências entre contas
  for (const acc of accounts) {
    await prisma.transfer.create({
      data: {
        amount: faker.number.int({ min: 100, max: 5000 }),
        type: faker.helpers.arrayElement([TransferType.PIX, TransferType.TED]),
        originId: adminAccount.id,
        destinationId: acc.id,
      },
    });
  }

  console.log('Seed finalizada com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

