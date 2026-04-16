jest.mock('@prisma/client', () => ({
  PrismaClient: class PrismaClient {},
}));

import { PrismaService } from '../prisma/prisma.service';
import { NegotiationQueryService } from './negotiation-query.service';

describe('NegotiationQueryService', () => {
  let service: NegotiationQueryService;
  let prisma: {
    transaction: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    comment: {
      findMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      transaction: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      comment: {
        findMany: jest.fn(),
      },
    };

    service = new NegotiationQueryService(prisma as unknown as PrismaService);
  });

  it('reads every negotiation with its history and exchanged cards', async () => {
    await service.findAll();

    expect(prisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          sender: true,
          receiver: true,
          senderCards: true,
          receiverCards: true,
          comments: { orderBy: { createdAt: 'asc' } },
        }),
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('reads one negotiation by id', async () => {
    await service.findOne(10);

    expect(prisma.transaction.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
      }),
    );
  });

  it('reads a negotiation history in chronological order', async () => {
    await service.getHistory(10);

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { transactionId: 10 },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('finds negotiations sent or received by a user', async () => {
    await service.findByUser(2);

    expect(prisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ senderId: 2 }, { receiverId: 2 }],
        },
      }),
    );
  });

  it('finds negotiations involving an object on either side', async () => {
    await service.findByObject(4);

    expect(prisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { senderCards: { some: { id: 4 } } },
            { receiverCards: { some: { id: 4 } } },
          ],
        },
      }),
    );
  });
});
