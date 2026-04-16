import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

const TransactionStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REFUSED: 'REFUSED',
} as const;

type NegotiationStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

@Injectable()
export class NegotiationCommandService {
  constructor(private readonly prisma: PrismaService) {}

  propose(data: CreateTransactionDto) {
    return this.db.transaction.create({ data });
  }

  addComment(transactionId: number, content: string) {
    return this.db.comment.create({
      data: {
        transactionId,
        content: content.trim(),
      },
    });
  }

  counterPropose(transactionId: number, data: UpdateTransactionDto) {
    return this.db.transaction.update({
      where: { id: transactionId },
      data: {
        ...data,
        status: TransactionStatus.PENDING,
      },
    });
  }

  accept(transactionId: number) {
    return this.changeStatus(transactionId, TransactionStatus.ACCEPTED);
  }

  refuse(transactionId: number) {
    return this.changeStatus(transactionId, TransactionStatus.REFUSED);
  }

  remove(transactionId: number) {
    return this.db.transaction.delete({ where: { id: transactionId } });
  }

  private changeStatus(transactionId: number, status: NegotiationStatus) {
    return this.db.transaction.update({
      where: { id: transactionId },
      data: { status },
    });
  }

  private get db() {
    return this.prisma as any;
  }
}
