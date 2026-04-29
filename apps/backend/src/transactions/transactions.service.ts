import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateNegotiationCommentDto } from './dto/create-negotiation-comment.dto';

const transactionInclude = {
  sender: true,
  receiver: true,
  senderCards: {
    orderBy: { id: 'asc' as const },
  },
  receiverCards: {
    orderBy: { id: 'asc' as const },
  },
  comments: {
    orderBy: { createdAt: 'asc' as const },
  },
};

@Injectable()
export class TransactionsService {
  constructor(
    private readonly commands: NegotiationCommandService,
    private readonly queries: NegotiationQueryService,
  ) {}

  create(data: CreateTransactionDto) {
    const { senderCardIds, receiverCardIds, status, ...transactionData } = data;

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
  }

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

  update(id: number, data: UpdateTransactionDto) {
    return this.prisma.transaction.update({
      where: { id },
      data,
      include: transactionInclude,
    });
  }

  remove(id: number) {
    return this.commands.remove(id);
  }

  accept(id: number) {
    return this.commands.accept(id);
  }

  addComment(id: number, content: string) {
    return this.commands.addComment(id, content);
  }

  refuse(id: number) {
    return this.commands.refuse(id);
  }

  history(id: number) {
    return this.queries.getHistory(id);
  }

  findByUser(userId: number) {
    return this.queries.findByUser(userId);
  }

  findByObject(cardId: number) {
    return this.queries.findByObject(cardId);
  }

  async addComment(id: number, data: CreateNegotiationCommentDto) {
    const content = data.content.trim();
    if (!content) {
      return this.findOne(id);
    }

    await this.prisma.comment.create({
      data: {
        transactionId: id,
        content,
      },
    });

    return this.findOne(id);
  }

  accept(id: number) {
    return this.update(id, { status: TransactionStatus.ACCEPTED });
  }

  refuse(id: number) {
    return this.update(id, { status: TransactionStatus.REFUSED });
  }
}
