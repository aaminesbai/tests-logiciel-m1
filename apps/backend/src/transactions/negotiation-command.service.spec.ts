jest.mock('@prisma/client', () => ({
  PrismaClient: class PrismaClient {},
  TransactionStatus: {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REFUSED: 'REFUSED',
  },
}));

import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NegotiationCommandService } from './negotiation-command.service';

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

    service = new NegotiationCommandService(prisma as unknown as PrismaService);
  });

  it('creates a negotiation proposal', async () => {
    const dto = {
      senderId: 1,
      receiverId: 2,
      message: 'Furret contre Suicune',
    };
    prisma.transaction.create.mockResolvedValue({ id: 10, ...dto });

    await expect(service.propose(dto)).resolves.toMatchObject({ id: 10 });

    expect(prisma.transaction.create).toHaveBeenCalledWith({ data: dto });
  });

  it('adds a trimmed comment to an existing negotiation', async () => {
    prisma.comment.create.mockResolvedValue({
      id: 3,
      transactionId: 10,
      content: 'Je peux ajouter une carte energie',
    });

    await service.addComment(10, '  Je peux ajouter une carte energie  ');

    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        transactionId: 10,
        content: 'Je peux ajouter une carte energie',
      },
    });
  });

  it('stores a counter-proposal and puts the negotiation back to pending', async () => {
    await service.counterPropose(10, { message: 'Contre-proposition' });

    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        message: 'Contre-proposition',
        status: TransactionStatus.PENDING,
      },
    });
  });

  it('accepts a negotiation', async () => {
    await service.accept(10);

    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { status: TransactionStatus.ACCEPTED },
    });
  });

  it('refuses a negotiation', async () => {
    await service.refuse(10);

    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { status: TransactionStatus.REFUSED },
    });
  });
});
