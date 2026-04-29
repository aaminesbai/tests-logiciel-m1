import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NegotiationCommandService } from './negotiation-command.service';
import { transactionInclude } from './negotiation.include';
import { NegotiationQueryService } from './negotiation-query.service';

describe('NegotiationCommandService', () => {
  let service: NegotiationCommandService;
  let prisma: {
    transaction: {
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    card: {
      findMany: jest.Mock;
    };
    comment: {
      create: jest.Mock;
    };
  };
  let queries: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      transaction: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      card: {
        findMany: jest.fn().mockResolvedValue([
          { id: 1, senderTransaction: null, receiverTransaction: null },
          { id: 2, senderTransaction: null, receiverTransaction: null },
          { id: 3, senderTransaction: null, receiverTransaction: null },
        ]),
      },
      comment: {
        create: jest.fn(),
      },
    };
    queries = {
      findOne: jest.fn(),
    };
    service = new NegotiationCommandService(
      prisma as unknown as PrismaService,
      queries as unknown as NegotiationQueryService,
    );
  });

  it('creates a proposal by connecting sender and receiver cards', async () => {
    const created = { id: 10, status: TransactionStatus.PENDING };
    prisma.transaction.create.mockResolvedValue(created);

    await expect(
      service.create({
        senderId: 1,
        receiverId: 2,
        senderCardIds: [1, 2],
        receiverCardIds: [3],
        message: 'Trade?',
      }),
    ).resolves.toBe(created);

    expect(prisma.transaction.create).toHaveBeenCalledWith({
      data: {
        senderId: 1,
        receiverId: 2,
        message: 'Trade?',
        status: undefined,
        senderCards: { connect: [{ id: 1 }, { id: 2 }] },
        receiverCards: { connect: [{ id: 3 }] },
      },
      include: transactionInclude,
    });
    expect(prisma.card.findMany).toHaveBeenCalledWith({
      where: { id: { in: [1, 2, 3] } },
      include: {
        senderTransaction: {
          select: { id: true, status: true },
        },
        receiverTransaction: {
          select: { id: true, status: true },
        },
      },
    });
  });

  it('rejects proposals involving a card already in an active negotiation', async () => {
    prisma.card.findMany.mockResolvedValue([
      {
        id: 1,
        senderTransaction: { id: 99, status: TransactionStatus.PENDING },
        receiverTransaction: null,
      },
      { id: 3, senderTransaction: null, receiverTransaction: null },
    ]);

    await expect(
      service.create({
        senderId: 1,
        receiverId: 2,
        senderCardIds: [1],
        receiverCardIds: [3],
        message: 'Trade?',
      }),
    ).rejects.toThrow('One or more cards are already in an active negotiation');

    expect(prisma.transaction.create).not.toHaveBeenCalled();
  });

  it('adds a trimmed comment and reloads the negotiation', async () => {
    const refreshed = { id: 1, comments: [{ content: 'ok' }] };
    queries.findOne.mockResolvedValue(refreshed);

    await expect(
      service.addComment(1, { content: '  ok  ' }),
    ).resolves.toBe(refreshed);

    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        transactionId: 1,
        content: 'ok',
      },
    });
    expect(queries.findOne).toHaveBeenCalledWith(1);
  });

  it('does not create a comment when content is blank', async () => {
    const refreshed = { id: 1, comments: [] };
    queries.findOne.mockResolvedValue(refreshed);

    await expect(service.addComment(1, { content: '   ' })).resolves.toBe(
      refreshed,
    );

    expect(prisma.comment.create).not.toHaveBeenCalled();
    expect(queries.findOne).toHaveBeenCalledWith(1);
  });

  it('stores a counter-proposal and puts the negotiation back to pending', async () => {
    await service.counterPropose(10, { message: 'Contre-proposition' });

    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        message: 'Contre-proposition',
        status: TransactionStatus.PENDING,
      },
      include: transactionInclude,
    });
  });

  it('accepts a negotiation', async () => {
    await service.accept(1);

    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: TransactionStatus.ACCEPTED },
      include: transactionInclude,
    });
  });

  it('refuses a negotiation', async () => {
    await service.refuse(1);

    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: TransactionStatus.REFUSED },
      include: transactionInclude,
    });
  });
});
