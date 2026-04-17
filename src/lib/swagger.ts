import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Bank System API',
    version: '2.0.0',
    description: 'REST API for a digital banking system',
  },
  servers: [{ url: '/api', description: 'API base path' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Account: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          number: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string', nullable: true },
          balance: { type: 'number', description: 'Balance in BRL' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Create a new account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'document', 'birth_date', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  document: { type: 'string', example: '12345678901' },
                  birth_date: { type: 'string', format: 'date', example: '1990-01-01' },
                  phone: { type: 'string', example: '11999999999' },
                  email: { type: 'string', format: 'email', example: 'john@email.com' },
                  password: { type: 'string', minLength: 6, example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Account created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    account: { $ref: '#/components/schemas/Account' },
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Document or email already in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate and get JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@email.com' },
                  password: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' } } } } },
          },
          403: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Account not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/accounts': {
      get: {
        tags: ['Accounts'],
        summary: 'List all accounts (admin)',
        parameters: [{ in: 'query', name: 'password', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'List of accounts', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Account' } } } } },
          403: { description: 'Invalid or missing bank password', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/accounts/{number}': {
      put: {
        tags: ['Accounts'],
        summary: 'Update account data',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'number', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Account updated' },
          401: { description: 'Token not provided' },
          403: { description: 'Invalid token' },
          404: { description: 'Account not found' },
        },
      },
      delete: {
        tags: ['Accounts'],
        summary: 'Delete account (balance must be zero)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'number', required: true, schema: { type: 'integer' } }],
        responses: {
          204: { description: 'Account deleted' },
          422: { description: 'Balance is not zero' },
        },
      },
    },
    '/transactions/deposit': {
      post: {
        tags: ['Transactions'],
        summary: 'Deposit amount into account',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['amount'], properties: { amount: { type: 'number', example: 100.50 } } },
            },
          },
        },
        responses: {
          201: { description: 'Deposit successful' },
          400: { description: 'Invalid amount' },
          401: { description: 'Token not provided' },
        },
      },
    },
    '/transactions/withdraw': {
      post: {
        tags: ['Transactions'],
        summary: 'Withdraw amount from account',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['amount'], properties: { amount: { type: 'number', example: 50 } } },
            },
          },
        },
        responses: {
          201: { description: 'Withdrawal successful' },
          422: { description: 'Insufficient balance' },
        },
      },
    },
    '/transactions/transfer': {
      post: {
        tags: ['Transactions'],
        summary: 'Transfer between accounts',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['destination_account', 'amount', 'type'],
                properties: {
                  destination_account: { type: 'integer', example: 1002 },
                  amount: { type: 'number', example: 100 },
                  type: { type: 'string', enum: ['PIX', 'TED', 'DOC', 'INTERNAL'], example: 'PIX' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Transfer successful' },
          422: { description: 'Insufficient balance or same account' },
        },
      },
    },
    '/transactions/balance': {
      get: {
        tags: ['Transactions'],
        summary: 'Get account balance',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current balance',
            content: { 'application/json': { schema: { type: 'object', properties: { balance: { type: 'number' } } } } },
          },
        },
      },
    },
    '/transactions/statement': {
      get: {
        tags: ['Transactions'],
        summary: 'Get full account statement',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Account statement',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    deposits: { type: 'array', items: { type: 'object' } },
                    withdrawals: { type: 'array', items: { type: 'object' } },
                    transfers_sent: { type: 'array', items: { type: 'object' } },
                    transfers_received: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
