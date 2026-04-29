import { Injectable } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNegotiationCommentDto } from './dto/create-negotiation-comment.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { transactionInclude } from './negotiation.include';
import { NegotiationQueryService } from './negotiation-query.service';

@Injectable()
export class NegotiationCommandService {
  constructor(
    private prisma: PrismaService,
    private queries: NegotiationQueryService,
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

  update(id: number, data: UpdateTransactionDto) {
    return this.prisma.transaction.update({
      where: { id },
      data,
      include: transactionInclude,
    });
  }

  remove(id: number) {
    return this.prisma.transaction.delete({ where: { id } });
  }

  async addComment(id: number, data: CreateNegotiationCommentDto) {
    const content = data.content.trim();
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
}
