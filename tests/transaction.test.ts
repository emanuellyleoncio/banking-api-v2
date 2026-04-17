import request from 'supertest';
import { createAccount } from './helper/createAccount';
import app from '../src/app';


describe('POST /api/transactions/deposit', () => {
  it('should deposit and return deposit info', async () => {
    const { token } = await createAccount();

    const res = await request(app)
      .post('/api/transactions/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 100 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('deposit_id');
    expect(res.body.amount).toBe(100);
  });

  it('should return 400 for zero amount', async () => {
    const { token } = await createAccount();

    const res = await request(app)
      .post('/api/transactions/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 0 });

    expect(res.status).toBe(400);
  });

  it('should return 401 without token', async () => {
    const res = await request(app)
      .post('/api/transactions/deposit')
      .send({ amount: 100 });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/transactions/withdraw', () => {
  it('should withdraw successfully', async () => {
    const { token } = await createAccount();

    await request(app)
      .post('/api/transactions/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 200 });

    const res = await request(app)
      .post('/api/transactions/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 50 });

    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(50);
  });

  it('should return 422 for insufficient balance', async () => {
    const { token } = await createAccount();

    const res = await request(app)
      .post('/api/transactions/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 999 });

    expect(res.status).toBe(422);
  });
});

describe('POST /api/transactions/transfer', () => {
  it('should transfer between accounts', async () => {
    const { token } = await createAccount({ document: '11111111111', email: 'origin@email.com' });
    const { account: dest } = await createAccount({ document: '22222222222', email: 'dest@email.com' });

    await request(app)
      .post('/api/transactions/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 300 });

    const res = await request(app)
      .post('/api/transactions/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({ destination_account: dest.number, amount: 100, type: 'PIX' });

    expect(res.status).toBe(201);
    expect(res.body.type).toBe('PIX');
    expect(res.body.amount).toBe(100);
  });

  it('should return 422 when transferring to same account', async () => {
    const { token, account } = await createAccount();

    await request(app)
      .post('/api/transactions/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 300 });

    const res = await request(app)
      .post('/api/transactions/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({ destination_account: account.number, amount: 100, type: 'TED' });

    expect(res.status).toBe(422);
  });
});

describe('GET /api/transactions/balance', () => {
  it('should return current balance', async () => {
    const { token } = await createAccount();

    await request(app)
      .post('/api/transactions/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 150 });

    const res = await request(app)
      .get('/api/transactions/balance')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(150);
  });
});

describe('GET /api/transactions/statement', () => {
  it('should return all transactions', async () => {
    const { token } = await createAccount();

    await request(app)
      .post('/api/transactions/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 200 });

    const res = await request(app)
      .get('/api/transactions/statement')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('deposits');
    expect(res.body).toHaveProperty('withdrawals');
    expect(res.body).toHaveProperty('transfers_sent');
    expect(res.body).toHaveProperty('transfers_received');
    expect(res.body.deposits).toHaveLength(1);
  });
});
