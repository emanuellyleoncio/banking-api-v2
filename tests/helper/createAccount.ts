import request from 'supertest';
import app from '../../src/app';


interface AccountData {
  name?: string;
  document?: string;
  email?: string;
  password?: string;
  birth_date?: string;
}

export async function createAccount(dataAcc: AccountData = {}) {
  const data = {
    name: dataAcc.name ?? 'John Doe',
    document: dataAcc.document ?? '12345678901',
    email: dataAcc.email ?? 'john@email.com',
    password: dataAcc.password ?? '123456',
    birth_date: dataAcc.birth_date ?? '1990-01-01',
  };

  const res = await request(app)
    .post('/api/auth/register')
    .send(data);

  return {
    token: res.body.token as string,
    account: res.body.account,
  };
}
