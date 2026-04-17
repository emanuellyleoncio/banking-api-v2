import request from 'supertest';
import { createAccount } from './helper/createAccount';
import app from '../src/app';


describe('POST /api/auth/register', () => {
  it('should create account and return token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      document: '12345678901',
      email: 'john@email.com',
      password: '123456',
      birth_date: '1990-01-01',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.account).toMatchObject({ name: 'John Doe', email: 'john@email.com' });
  });

  it('should return 409 if document already exists', async () => {
    await createAccount({ document: '12345678901' });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Other',
      document: '12345678901',
      email: 'other@email.com',
      password: '123456',
      birth_date: '1990-01-01',
    });

    expect(res.status).toBe(409);
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John',
      document: '12345678901',
      email: 'not-an-email',
      password: '123456',
      birth_date: '1990-01-01',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('should return token with valid credentials', async () => {
    await createAccount();

    const res = await request(app).post('/api/auth/login').send({
      email: 'john@email.com',
      password: '123456',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should return 403 with wrong password', async () => {
    await createAccount();

    const res = await request(app).post('/api/auth/login').send({
      email: 'john@email.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(403);
  });

  it('should return 404 if account does not exist', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@email.com',
      password: '123456',
    });

    expect(res.status).toBe(404);
  });
});
