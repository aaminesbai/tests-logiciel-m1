# Monorepo React + Nest

## Install

```bash
npm install
```

## Seed database

```bash
cd apps/backend
DATABASE_URL="file:./dev.db" npx prisma migrate deploy
DATABASE_URL="file:./dev.db" npx ts-node prisma/scripts/pokemon-seed.ts
```

## Run backend

```bash
npm run dev:backend
```

## Run frontend

```bash
npm run dev:frontend
```

## Run tests

```bash
npm run test -w backend
npm run test:e2e -w backend
npm run lint -w frontend
```

The backend e2e suite includes load/concurrency checks for negotiations:
- many concurrent proposals targeting the same cards must leave exactly one active negotiation;
- many concurrent comments on the same negotiation must keep a complete history.

## Test account

Email: `test@poketrade.dev`

Password: `test`
