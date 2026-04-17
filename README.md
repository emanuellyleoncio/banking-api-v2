# Bank System API

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-tested-C21325?style=flat-square&logo=jest&logoColor=white)
![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-enabled-F5A800?style=flat-square&logo=opentelemetry&logoColor=white)

REST API for a digital banking system. This is **version 2** of a project originally built during a junior development bootcamp. The original version used in-memory arrays as a "database", hardcoded credentials in source code, plain-text passwords, and no separation of concerns between routing, business logic, and data access.

Version 2 is a complete rewrite with a production-grade architecture, addressing every structural and security problem from v1.

---

## What changed from v1

| Concern | v1 (junior) | v2 (this project) |
|---|---|---|
| Database | JavaScript array in memory | PostgreSQL with Prisma ORM |
| Authentication | Password in query string | JWT with Bearer token |
| Password storage | Plain text | bcrypt (cost factor 10) |
| Secrets | Hardcoded in source code | Environment variables |
| Architecture | Logic inside route handlers | Routes, controllers, services, lib |
| Error handling | Ad-hoc if/else per route | Centralized error handler with custom error classes |
| Validation | Manual field checks | Zod schemas with coercion |
| Monetary values | Floating point numbers | Integer cents to avoid precision bugs |
| Testing | None | Integration tests with Jest and Supertest |
| Observability | None | Distributed tracing with OpenTelemetry and Jaeger |
| Security headers | None | Helmet |
| Rate limiting | None | express-rate-limit |
| Documentation | Screenshots in README | Swagger UI at /docs |

---

## Features

- Account registration and JWT authentication
- Deposit, withdrawal, and transfer between accounts (PIX, TED, DOC, INTERNAL)
- Account statement and balance queries
- Administrative account listing protected by a bank-level password
- Distributed tracing with OpenTelemetry exported to Jaeger
- Swagger documentation available at runtime
- Full integration test suite against a dedicated test database

---

## Tech stack

- **Runtime:** Node.js 20
- **Language:** TypeScript (ESM)
- **Framework:** Express 4
- **ORM:** Prisma 7 with pg driver adapter
- **Database:** PostgreSQL 15
- **Validation:** Zod
- **Authentication:** jsonwebtoken + bcryptjs
- **Testing:** Jest + Supertest
- **Observability:** OpenTelemetry SDK + Jaeger
- **Security:** Helmet + express-rate-limit
- **Logging:** Pino
- **Containerization:** Docker + Docker Compose

---

## Project structure

```
src/
├── controllers/      HTTP layer - receives request, calls service, sends response
├── services/         Business logic - all rules live here
├── routes/           Route definitions and middleware assignment
├── middlewares/      Auth (JWT), admin auth, Zod validation, error handler
├── schemas/          Zod input schemas, one per domain
├── errors/           Custom error classes with HTTP status codes
├── lib/
│   ├── prisma.ts     Prisma client singleton
│   ├── logger.ts     Pino logger singleton
│   ├── tracer.ts     OpenTelemetry SDK setup
│   ├── tracing.ts    withSpan helper for manual instrumentation
│   └── env.ts        Environment variable validation on startup
prisma/
├── schema.prisma     Database schema
├── migrations/       Migration history
└── seed.ts           Development seed with faker data
tests/
├── setup.ts          Database setup and teardown hooks
├── env.ts            Test environment variable injection
├── helpers/          Shared test utilities (createAccount)
├── auth.test.ts
├── account.test.ts
└── transaction.test.ts
```

---

## Getting started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose (v2)

### Local setup

1. Clone the repository

```bash
git clone https://github.com/your-username/bank-system-api
cd bank-system-api
```

2. Install dependencies

```bash
npm install
```

3. Copy the environment file and fill in the values

```bash
cp .env.example .env
```

4. Start the infrastructure (PostgreSQL + test database + Jaeger)

```bash
npm run infra:local
```

5. Run migrations

```bash
npx prisma migrate deploy
```

6. (Optional) Seed the database with test data

```bash
npm run seed
```

7. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.
Swagger documentation will be at `http://localhost:3000/docs`.
Jaeger UI will be at `http://localhost:16686`.

---

## Environment variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/bank-db` |
| `JWT_SECRET` | Secret key for signing JWT tokens | any long random string |
| `JWT_EXPIRES_IN` | JWT expiration duration | `7d` |
| `BANK_ADMIN_PASSWORD` | Password for the admin account listing route | any strong string |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP endpoint for trace export | `http://localhost:4318/v1/traces` |
| `PORT` | HTTP server port (optional, default 3000) | `3000` |

All variables except `PORT` are required. The server validates them on startup and exits immediately with a clear error message if any are missing.

---

## API reference

Full interactive documentation is available at `/docs` when the server is running.

### Authentication

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create account and receive JWT | Public |
| POST | `/api/auth/login` | Authenticate and receive JWT | Public |

### Accounts

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/accounts` | List all accounts | Bank password (query param) |
| PUT | `/api/accounts/:number` | Update account data | JWT |
| DELETE | `/api/accounts/:number` | Delete account (balance must be zero) | JWT |

### Transactions

All transaction routes require a valid JWT in the `Authorization: Bearer <token>` header. The account is identified from the token, not from the request body.

| Method | Path | Description |
|---|---|---|
| POST | `/api/transactions/deposit` | Deposit into authenticated account |
| POST | `/api/transactions/withdraw` | Withdraw from authenticated account |
| POST | `/api/transactions/transfer` | Transfer to another account (PIX, TED, DOC, INTERNAL) |
| GET | `/api/transactions/balance` | Get current balance |
| GET | `/api/transactions/statement` | Get full transaction history |

---

## Running tests

Tests run against a dedicated database (`bank-test-db`) to avoid interfering with development data.

Make sure the test database container is running:

```bash
npm run infra:local
```

Run the test suite:

```bash
npm test
```

Run in watch mode during development:

```bash
npm run test:watch
```

Tests use `--runInBand` to execute serially. This avoids race conditions on database cleanup between test files.

---

## Docker

### Run with Docker Compose (production mode)

Create a `.env.production` file with real secrets (do not commit this file):

```env
JWT_SECRET=a_long_random_string
BANK_ADMIN_PASSWORD=another_strong_password
JWT_EXPIRES_IN=7d
```

Start all services:

```bash
npm run infra:prod
```

This builds the API image, runs migrations on startup, and starts PostgreSQL and Jaeger alongside the API.

### Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to dist/ |
| `npm start` | Run compiled output |
| `npm test` | Run integration test suite |
| `npm run seed` | Seed database with development data |
| `npm run infra:local` | Start local infrastructure via Docker Compose |
| `npm run infra:down` | Stop local infrastructure |
| `npm run infra:prod` | Build and start full production stack |

---

## Technical decisions

### Monetary values stored as integer cents

Floating point arithmetic is not suitable for money. `0.1 + 0.2` in JavaScript equals `0.30000000000000004`. All amounts are stored as integers representing cents (R$ 1.50 becomes `150`). Conversion to and from reais happens only at the API boundary, in the service layer.

### UUID as primary key for accounts

The original project used an auto-incrementing integer as the account ID. Sequential integers expose the total number of accounts in the system and make endpoints predictable to enumerate. UUIDs are generated by PostgreSQL using `gen_random_uuid()` and carry no information about other records.

Account numbers (the human-readable identifier shown to users) remain sequential integers, generated via a PostgreSQL sequence starting at 1001.

### JWT carries the account ID

Transaction routes do not receive an account number in the request body. The account is identified from the JWT payload, which is set at login or registration. This eliminates a class of bugs and attacks where a user could manipulate the account number in the request to operate on another account.

### Prisma with pg driver adapter

Prisma 7 introduced driver adapters as the recommended way to configure the underlying database connection. Using `PrismaPg` with `@prisma/adapter-pg` gives direct control over connection pool settings and is the approach recommended for production deployments.

### Custom error classes with status codes

Each error type carries its own HTTP status code. The global error handler in Express checks `instanceof AppError` and uses `err.statusCode` directly. This keeps controllers free of status code logic and makes error behavior consistent and testable.

### withSpan helper for OpenTelemetry

Manual spans wrap service methods without adding try/catch blocks to the service layer. The `withSpan` helper handles span lifecycle, sets the status on error, and always calls `span.end()` in a finally block. Errors are rethrown so controllers continue to handle them normally.

### Separation of app.ts and server.ts

`app.ts` builds and exports the Express application without calling `listen`. `server.ts` imports the app and starts the HTTP server. This pattern allows tests to import the app directly and use Supertest without binding to a port, and makes it straightforward to add graceful shutdown logic in one place.

---

## Author

Emanuelly Leoncio
