import { ConflictException, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

const users = [
  { id: 1, email: 'test@poketrade.dev', username: 'Alice', password: 'test' },
  { id: 2, email: 'bruno@poketrade.dev', username: 'Bruno', password: 'test' },
];

const cards = [
  { id: 1, cardId: 'swsh3-136', name: 'Furret', ownerId: 1 },
  { id: 2, cardId: 'swsh3-24', name: 'Centiskorch', ownerId: 1 },
  { id: 3, cardId: 'swsh3-44', name: 'Suicune', ownerId: 2 },
];

function enrichCard(card: (typeof cards)[number]) {
  return {
    image: `${card.name}.webp`,
    rarity: 'Rare',
    setId: 'swsh3',
    setName: 'Darkness Ablaze',
    hp: 100,
    types: 'Pokemon',
    ...card,
  };
}

function createLoadPrismaMock() {
  let nextTransactionId = 1;
  let nextCommentId = 1;
  const transactions: any[] = [];

  const findTransaction = (id: number) =>
    transactions.find((transaction) => transaction.id === id) || null;

  const hydrate = (transaction: any) => ({
    ...transaction,
    sender: users.find((user) => user.id === transaction.senderId),
    receiver: users.find((user) => user.id === transaction.receiverId),
    senderCards: transaction.senderCardIds.map((id: number) =>
      enrichCard(cards.find((card) => card.id === id)!),
    ),
    receiverCards: transaction.receiverCardIds.map((id: number) =>
      enrichCard(cards.find((card) => card.id === id)!),
    ),
  });

  return {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findMany: jest.fn().mockResolvedValue(users),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        return users.find((user) => user.id === where.id || user.email === where.email) || null;
      }),
    },
    card: {
      findMany: jest.fn().mockImplementation(async ({ where }) => {
        await new Promise((resolve) => setTimeout(resolve, 3));
        const requestedIds = where.id.in;
        return cards
          .filter((card) => requestedIds.includes(card.id))
          .map((card) => {
            const senderTransaction = transactions.find(
              (transaction) =>
                transaction.senderCardIds.includes(card.id) &&
                ['PENDING', 'ACCEPTED'].includes(transaction.status),
            );
            const receiverTransaction = transactions.find(
              (transaction) =>
                transaction.receiverCardIds.includes(card.id) &&
                ['PENDING', 'ACCEPTED'].includes(transaction.status),
            );

            return {
              ...enrichCard(card),
              senderTransaction: senderTransaction
                ? { id: senderTransaction.id, status: senderTransaction.status }
                : null,
              receiverTransaction: receiverTransaction
                ? { id: receiverTransaction.id, status: receiverTransaction.status }
                : null,
            };
          });
      }),
    },
    transaction: {
      findMany: jest.fn().mockImplementation(({ where } = {}) => {
        let rows = transactions;

        if (where?.OR?.some((entry: any) => entry.senderId || entry.receiverId)) {
          const userIds = where.OR.flatMap((entry: any) => [
            entry.senderId,
            entry.receiverId,
          ]).filter(Boolean);
          rows = rows.filter(
            (transaction) =>
              userIds.includes(transaction.senderId) ||
              userIds.includes(transaction.receiverId),
          );
        }

        if (where?.OR?.some((entry: any) => entry.senderCards || entry.receiverCards)) {
          const cardIds = where.OR.flatMap((entry: any) => [
            entry.senderCards?.some?.id,
            entry.receiverCards?.some?.id,
          ]).filter(Boolean);
          rows = rows.filter(
            (transaction) =>
              transaction.senderCardIds.some((id: number) => cardIds.includes(id)) ||
              transaction.receiverCardIds.some((id: number) => cardIds.includes(id)),
          );
        }

        return rows.map(hydrate);
      }),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        const transaction = findTransaction(where.id);
        return transaction ? hydrate(transaction) : null;
      }),
      create: jest.fn().mockImplementation(async ({ data }) => {
        await new Promise((resolve) => setTimeout(resolve, 3));
        const allCardIds = [
          ...data.senderCards.connect.map(({ id }: { id: number }) => id),
          ...data.receiverCards.connect.map(({ id }: { id: number }) => id),
        ];
        const alreadyUsed = transactions.some(
          (transaction) =>
            ['PENDING', 'ACCEPTED'].includes(transaction.status) &&
            allCardIds.some(
              (id) =>
                transaction.senderCardIds.includes(id) ||
                transaction.receiverCardIds.includes(id),
            ),
        );

        if (alreadyUsed) {
          throw new ConflictException('Concurrent card reuse detected');
        }

        const transaction = {
          id: nextTransactionId++,
          createdAt: new Date().toISOString(),
          status: data.status || 'PENDING',
          message: data.message,
          senderId: data.senderId,
          receiverId: data.receiverId,
          senderCardIds: data.senderCards.connect.map(({ id }: { id: number }) => id),
          receiverCardIds: data.receiverCards.connect.map(({ id }: { id: number }) => id),
          comments: [],
        };
        transactions.push(transaction);
        return hydrate(transaction);
      }),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const transaction = findTransaction(where.id);
        Object.assign(transaction, data);
        return hydrate(transaction);
      }),
      delete: jest.fn(),
    },
    comment: {
      findMany: jest.fn().mockImplementation(({ where }) => {
        return findTransaction(where.transactionId)?.comments || [];
      }),
      create: jest.fn().mockImplementation(({ data }) => {
        const transaction = findTransaction(data.transactionId);
        const comment = {
          id: nextCommentId++,
          content: data.content,
          createdAt: new Date().toISOString(),
          transactionId: data.transactionId,
        };
        transaction.comments.push(comment);
        return comment;
      }),
    },
    inspectTransactions: () => transactions.map(hydrate),
  };
}

describe('Negotiation load and concurrent exchange consistency (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: ReturnType<typeof createLoadPrismaMock>;

  beforeEach(async () => {
    prisma = createLoadPrismaMock();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('keeps one coherent negotiation when many concurrent proposals target the same cards', async () => {
    const attempts = 40;
    const responses = await Promise.all(
      Array.from({ length: attempts }, (_, index) =>
        request(app.getHttpServer())
          .post('/negotiations')
          .send({
            senderId: 1,
            receiverId: 2,
            senderCardIds: [1],
            receiverCardIds: [3],
            message: `Concurrent proposal ${index}`,
          }),
      ),
    );

    const created = responses.filter((response) => response.status === 201);
    const conflicts = responses.filter((response) => response.status === 409);

    expect(created).toHaveLength(1);
    expect(conflicts).toHaveLength(attempts - 1);

    const history = await request(app.getHttpServer())
      .get('/negotiations/object/1')
      .expect(200);

    expect(history.body).toHaveLength(1);
    expect(history.body[0].senderCards.map((card: any) => card.id)).toEqual([1]);
    expect(history.body[0].receiverCards.map((card: any) => card.id)).toEqual([3]);
    expect(prisma.inspectTransactions()).toHaveLength(1);
  });

  it('handles concurrent comments without losing history entries', async () => {
    const created = await request(app.getHttpServer())
      .post('/negotiations')
      .send({
        senderId: 1,
        receiverId: 2,
        senderCardIds: [2],
        receiverCardIds: [3],
        message: 'Initial proposal',
      })
      .expect(201);

    const comments = 60;
    const responses = await Promise.all(
      Array.from({ length: comments }, (_, index) =>
        request(app.getHttpServer())
          .post(`/negotiations/${created.body.id}/comments`)
          .send({ content: `load-comment-${index}` }),
      ),
    );

    expect(responses.every((response) => response.status === 201)).toBe(true);

    const history = await request(app.getHttpServer())
      .get(`/negotiations/${created.body.id}/history`)
      .expect(200);

    expect(history.body).toHaveLength(comments);
    expect(new Set(history.body.map((comment: any) => comment.content)).size).toBe(
      comments,
    );
  });
});
