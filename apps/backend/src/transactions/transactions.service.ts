import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateNegotiationCommentDto } from './dto/create-negotiation-comment.dto';
import { NegotiationCommandService } from './negotiation-command.service';
import { NegotiationQueryService } from './negotiation-query.service';

@Injectable()
export class TransactionsService {
  constructor(
    private commands: NegotiationCommandService,
    private queries: NegotiationQueryService,
  ) {}

  create(data: CreateTransactionDto) {
    return this.commands.create(data);
  }

  findAll() {
    return this.queries.findAll();
  }

  findOne(id: number) {
    return this.queries.findOne(id);
  }

  update(id: number, data: UpdateTransactionDto) {
    return this.commands.update(id, data);
  }

  remove(id: number) {
    return this.commands.remove(id);
  }

  addComment(id: number, data: CreateNegotiationCommentDto) {
    return this.commands.addComment(id, data);
  }

  accept(id: number) {
    return this.commands.accept(id);
  }

  refuse(id: number) {
    return this.commands.refuse(id);
  }
}
