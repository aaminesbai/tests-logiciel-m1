import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NegotiationCommandService } from './negotiation-command.service';
import { NegotiationQueryService } from './negotiation-query.service';
import { transactionInclude } from './negotiation.include';

describe('NegotiationCommandService', () => {
  let service: NegotiationCommandService;
  let prisma: {
    transaction: {
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
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

  it('accepts a negotiation', async () => {
    prisma.transaction.update.mockResolvedValue({
      id: 1,
      status: TransactionStatus.ACCEPTED,
    });

    await service.accept(1);

    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: TransactionStatus.ACCEPTED },
      include: transactionInclude,
    });
  });

  it('refuses a negotiation', async () => {
    prisma.transaction.update.mockResolvedValue({
      id: 1,
      status: TransactionStatus.REFUSED,
    });

    await service.refuse(1);

    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: TransactionStatus.REFUSED },
      include: transactionInclude,
    });
  });
});
