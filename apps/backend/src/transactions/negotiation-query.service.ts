import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { transactionInclude } from './negotiation.include';

@Injectable()
export class NegotiationQueryService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.transaction.findMany({
      include: transactionInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: transactionInclude,
    });

    if (!transaction) {
      throw new NotFoundException(`Negotiation ${id} not found`);
    }

    return transaction;
  }

  findByUser(userId: number) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: transactionInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findByCard(cardId: number) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { senderCards: { some: { id: cardId } } },
          { receiverCards: { some: { id: cardId } } },
        ],
      },
      include: transactionInclude,
      orderBy: { createdAt: 'desc' },
    });
  }
}
