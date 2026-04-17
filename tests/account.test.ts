import request from 'supertest';
import { createAccount } from './helper/createAccount';
import app from '../src/app';



describe('GET /api/accounts', () => {
    it('should list accounts with valid bank password', async () => {
        await createAccount();

        const res = await request(app)
            .get('/api/accounts')
            .query({ password: 'test_bank_password' });

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return 403 without bank password', async () => {
        const res = await request(app).get('/api/accounts');
        expect(res.status).toBe(403);
    });
});

describe('PUT /api/accounts/:number', () => {
    it('should update account name', async () => {
        const { token, account } = await createAccount();

        const res = await request(app)
            .put(`/api/accounts/${account.number}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Updated Name' });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Updated Name');
    });
});

describe('DELETE /api/accounts/:number', () => {
    it('should return 422 if balance is not zero', async () => {
        const { token, account } = await createAccount({
            document: '11111111111',
            email: 'delete1@email.com',
        });

        const deposit = await request(app)
            .post('/api/transactions/deposit')
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 100 });

        expect(deposit.status).toBe(201);

        const res = await request(app)
            .delete(`/api/accounts/${account.number}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(422);
    });

    it('should delete account with zero balance', async () => {
        const { token, account } = await createAccount({
            document: '22222222222',
            email: 'delete2@email.com',
        });

        const res = await request(app)
            .delete(`/api/accounts/${account.number}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(204);
    });
});
