import { ConflictException, Injectable } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNegotiationCommentDto } from './dto/create-negotiation-comment.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { transactionInclude } from './negotiation.include';
import { NegotiationQueryService } from './negotiation-query.service';

@Injectable()
export class NegotiationCommandService {
  private static readonly lockedCardIds = new Set<number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: NegotiationQueryService,
  ) {}

  create(data: CreateTransactionDto) {
    const { senderCardIds, receiverCardIds, status, ...transactionData } = data;
    const cardIds = [...new Set([...senderCardIds, ...receiverCardIds])];

    return this.withCardLocks(cardIds, async () => {
      await this.assertCardsAvailable(cardIds);

      return this.prisma.transaction.create({
        data: {
          ...transactionData,
          status,
          senderCards: {
            connect: senderCardIds.map((id) => ({ id })),
          },
          receiverCards: {
            connect: receiverCardIds.map((id) => ({ id })),
          },
        },
        include: transactionInclude,
      });
    });
  }

  propose(data: CreateTransactionDto) {
    return this.create(data);
  }

  update(id: number, data: UpdateTransactionDto) {
    return this.prisma.transaction.update({
      where: { id },
      data,
      include: transactionInclude,
    });
  }

  counterPropose(id: number, data: UpdateTransactionDto) {
    return this.update(id, {
      ...data,
      status: TransactionStatus.PENDING,
    });
  }

  remove(id: number) {
    return this.prisma.transaction.delete({ where: { id } });
  }

  async addComment(id: number, data: CreateNegotiationCommentDto | string) {
    const content = typeof data === 'string' ? data.trim() : data.content.trim();
    if (!content) {
      return this.queries.findOne(id);
    }

    await this.prisma.comment.create({
      data: {
        transactionId: id,
        content,
      },
    });

    return this.queries.findOne(id);
  }

  accept(id: number) {
    return this.update(id, { status: TransactionStatus.ACCEPTED });
  }

  refuse(id: number) {
    return this.update(id, { status: TransactionStatus.REFUSED });
  }

  private async withCardLocks<T>(cardIds: number[], action: () => Promise<T>) {
    const locked = cardIds.some((id) =>
      NegotiationCommandService.lockedCardIds.has(id),
    );
    if (locked) {
      throw new ConflictException('One or more cards are already being negotiated');
    }

    cardIds.forEach((id) => NegotiationCommandService.lockedCardIds.add(id));
    try {
      return await action();
    } finally {
      cardIds.forEach((id) => NegotiationCommandService.lockedCardIds.delete(id));
    }
  }

  private async assertCardsAvailable(cardIds: number[]) {
    const cards = await this.prisma.card.findMany({
      where: { id: { in: cardIds } },
      include: {
        senderTransaction: {
          select: { id: true, status: true },
        },
        receiverTransaction: {
          select: { id: true, status: true },
        },
      },
    });

    if (cards.length !== cardIds.length) {
      throw new ConflictException('One or more cards do not exist');
    }

    const activeStatuses: TransactionStatus[] = [
      TransactionStatus.PENDING,
      TransactionStatus.ACCEPTED,
    ];
    const unavailable = cards.some((card) => {
      const senderStatus = card.senderTransaction?.status;
      const receiverStatus = card.receiverTransaction?.status;

      return (
        (senderStatus && activeStatuses.includes(senderStatus)) ||
        (receiverStatus && activeStatuses.includes(receiverStatus))
      );
    });

    if (unavailable) {
      throw new ConflictException('One or more cards are already in an active negotiation');
    }
  }
}
