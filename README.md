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

## Test account

Email: `test@poketrade.dev`

Password: `test`
