import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const negotiationInclude = {
  sender: true,
  receiver: true,
  senderCards: true,
  receiverCards: true,
  comments: {
    orderBy: { createdAt: 'asc' },
  },
} as const;

@Injectable()
export class NegotiationQueryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.db.transaction.findMany({
      include: negotiationInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(transactionId: number) {
    return this.db.transaction.findUnique({
      where: { id: transactionId },
      include: negotiationInclude,
    });
  }

  getHistory(transactionId: number) {
    return this.db.comment.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  findByUser(userId: number) {
    return this.db.transaction.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: negotiationInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findByObject(cardId: number) {
    return this.db.transaction.findMany({
      where: {
        OR: [
          { senderCards: { some: { id: cardId } } },
          { receiverCards: { some: { id: cardId } } },
        ],
      },
      include: negotiationInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  private get db() {
    return this.prisma as any;
  }
}
