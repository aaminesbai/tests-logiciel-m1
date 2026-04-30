import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

const usersSeed = [
  {
    id: 1,
    email: 'test@poketrade.dev',
    username: 'Alice',
    password: 'test',
    cards: [
      {
        id: 1,
        cardId: 'swsh3-136',
        name: 'Furret',
        image: 'furret.webp',
        rarity: 'Uncommon',
        setId: 'swsh3',
        setName: 'Darkness Ablaze',
        hp: 110,
        types: 'Colorless',
        ownerId: 1,
      },
      {
        id: 2,
        cardId: 'swsh3-24',
        name: 'Centiskorch',
        image: 'centiskorch.webp',
        rarity: 'Rare',
        setId: 'swsh3',
        setName: 'Darkness Ablaze',
        hp: 130,
        types: 'Fire',
        ownerId: 1,
      },
    ],
  },
  {
    id: 2,
    email: 'bruno@poketrade.dev',
    username: 'Bruno',
    password: 'test',
    cards: [
      {
        id: 3,
        cardId: 'swsh3-44',
        name: 'Suicune',
        image: 'suicune.webp',
        rarity: 'Rare',
        setId: 'swsh3',
        setName: 'Darkness Ablaze',
        hp: 110,
        types: 'Water',
        ownerId: 2,
      },
    ],
  },
];

function withoutPasswords() {
  return usersSeed.map(({ password, ...user }) => user);
}

function createNegotiation(overrides = {}) {
  return {
    id: 1,
    createdAt: '2026-02-26T10:30:00.000Z',
    status: 'PENDING',
    message: 'Salut, je te propose Furret contre Suicune.',
    senderId: 1,
    receiverId: 2,
    sender: withoutPasswords()[0],
    receiver: withoutPasswords()[1],
    senderCards: [usersSeed[0].cards[0]],
    receiverCards: [usersSeed[1].cards[0]],
    comments: [
      {
        id: 1,
        content: 'Salut, je te propose Furret contre Suicune.',
        createdAt: '2026-02-26T10:30:00.000Z',
        transactionId: 1,
      },
    ],
    ...overrides,
  };
}

function createPrismaMock() {
  let negotiation = createNegotiation();
  let nextNegotiationId = 2;
  let nextCommentId = 2;

  return {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findMany: jest.fn().mockImplementation(() => withoutPasswords()),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.email) {
          return usersSeed.find((user) => user.email === where.email) || null;
        }
        const user = usersSeed.find((entry) => entry.id === where.id);
        if (!user) return null;
        const { password, ...safeUser } = user;
        return safeUser;
      }),
    },
    transaction: {
      findMany: jest.fn().mockImplementation(() => [negotiation]),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        return where.id === negotiation.id ? negotiation : null;
      }),
      create: jest.fn().mockImplementation(({ data }) => {
        negotiation = createNegotiation({
          id: nextNegotiationId++,
          message: data.message,
          senderId: data.senderId,
          receiverId: data.receiverId,
          senderCards: data.senderCards.connect.map(({ id }) =>
            usersSeed.flatMap((user) => user.cards).find((card) => card.id === id),
          ),
          receiverCards: data.receiverCards.connect.map(({ id }) =>
            usersSeed.flatMap((user) => user.cards).find((card) => card.id === id),
          ),
          comments: [],
        });
        return negotiation;
      }),
      update: jest.fn().mockImplementation(({ data }) => {
        negotiation = { ...negotiation, ...data };
        return negotiation;
      }),
      delete: jest.fn().mockImplementation(() => negotiation),
    },
    card: {
      findMany: jest.fn().mockImplementation(({ where }) => {
        const ids = where.id.in;
        return usersSeed
          .flatMap((user) => user.cards)
          .filter((card) => ids.includes(card.id))
          .map((card) => ({
            ...card,
            senderTransaction: null,
            receiverTransaction: null,
          }));
      }),
    },
    comment: {
      create: jest.fn().mockImplementation(({ data }) => {
        negotiation = {
          ...negotiation,
          comments: [
            ...negotiation.comments,
            {
              id: nextCommentId++,
              content: data.content,
              createdAt: '2026-02-26T10:45:00.000Z',
              transactionId: data.transactionId,
            },
          ],
        };
        return negotiation.comments.at(-1);
      }),
    },
  };
}

describe('Catalogue and negotiations functional flow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
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

  it('lists catalogue users with cards and without passwords', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog/users')
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({
      id: 1,
      email: 'test@poketrade.dev',
      username: 'Alice',
    });
    expect(response.body[0].password).toBeUndefined();
    expect(response.body[0].cards).toHaveLength(2);
  });

  it('logs in the seeded user and rejects invalid credentials', async () => {
    const success = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@poketrade.dev', password: 'test' })
      .expect(201);

    expect(success.body).toMatchObject({
      id: 1,
      email: 'test@poketrade.dev',
      username: 'Alice',
    });
    expect(success.body.password).toBeUndefined();

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@poketrade.dev', password: 'bad' })
      .expect(401);
  });

  it('reads a negotiation history with sender, receiver, cards and comments', async () => {
    const response = await request(app.getHttpServer())
      .get('/negotiations/1')
      .expect(200);

    expect(response.body).toMatchObject({
      id: 1,
      senderId: 1,
      receiverId: 2,
      sender: { username: 'Alice' },
      receiver: { username: 'Bruno' },
    });
    expect(response.body.senderCards).toHaveLength(1);
    expect(response.body.receiverCards).toHaveLength(1);
    expect(response.body.comments).toHaveLength(1);
  });

  it('returns 404 for an unknown negotiation', async () => {
    await request(app.getHttpServer()).get('/negotiations/999').expect(404);
  });

  it('validates proposal payloads and creates a valid proposal', async () => {
    await request(app.getHttpServer())
      .post('/negotiations')
      .send({ senderId: 1, receiverId: 2, message: 'missing cards' })
      .expect(400);

    const response = await request(app.getHttpServer())
      .post('/negotiations')
      .send({
        senderId: 1,
        receiverId: 2,
        senderCardIds: [1],
        receiverCardIds: [3],
        message: 'Nouvelle proposition',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      id: 2,
      senderId: 1,
      receiverId: 2,
      message: 'Nouvelle proposition',
    });
    expect(response.body.senderCards[0].id).toBe(1);
    expect(response.body.receiverCards[0].id).toBe(3);
  });

  it('ignores blank comments and adds valid comments', async () => {
    const blank = await request(app.getHttpServer())
      .post('/negotiations/1/comments')
      .send({ content: '   ', userId: 1 })
      .expect(201);

    expect(blank.body.comments).toHaveLength(1);

    const valid = await request(app.getHttpServer())
      .post('/negotiations/1/comments')
      .send({ content: 'Je peux ajouter une energie.', userId: 1 })
      .expect(201);

    expect(valid.body.comments).toHaveLength(2);
    expect(valid.body.comments[1].content).toBe('Je peux ajouter une energie.');
  });

  it('accepts and refuses a negotiation', async () => {
    const accepted = await request(app.getHttpServer())
      .patch('/negotiations/1/accept')
      .expect(200);

    expect(accepted.body.status).toBe('ACCEPTED');

    const refused = await request(app.getHttpServer())
      .patch('/negotiations/1/refuse')
      .expect(200);

    expect(refused.body.status).toBe('REFUSED');
  });
});
