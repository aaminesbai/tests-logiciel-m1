import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { transactionInclude } from './negotiation.include';
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

  it('reads all negotiations with their relations', async () => {
    const rows = [{ id: 1 }];
    prisma.transaction.findMany.mockResolvedValue(rows);

    await expect(service.findAll()).resolves.toBe(rows);

    expect(prisma.transaction.findMany).toHaveBeenCalledWith({
      include: transactionInclude,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('reads one negotiation with relations', async () => {
    const row = { id: 1 };
    prisma.transaction.findUnique.mockResolvedValue(row);

    await expect(service.findOne(1)).resolves.toBe(row);

    expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: transactionInclude,
    });
  });

  it('throws when a negotiation cannot be found', async () => {
    prisma.transaction.findUnique.mockResolvedValue(null);

    await expect(service.findOne(404)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('reads a negotiation history in chronological order', async () => {
    await service.getHistory(10);

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { transactionId: 10 },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('reads negotiations by user as sender or receiver', async () => {
    await service.findByUser(1);

    expect(prisma.transaction.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ senderId: 1 }, { receiverId: 1 }],
      },
      include: transactionInclude,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('reads negotiations by sender or receiver card', async () => {
    await service.findByCard(3);

    expect(prisma.transaction.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { senderCards: { some: { id: 3 } } },
          { receiverCards: { some: { id: 3 } } },
        ],
      },
      include: transactionInclude,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('keeps findByObject as an alias for object-oriented queries', async () => {
    await service.findByObject(4);

    expect(prisma.transaction.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { senderCards: { some: { id: 4 } } },
          { receiverCards: { some: { id: 4 } } },
        ],
      },
      include: transactionInclude,
      orderBy: { createdAt: 'desc' },
    });
  });
});
