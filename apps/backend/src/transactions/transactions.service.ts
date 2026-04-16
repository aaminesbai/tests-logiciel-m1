import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { NegotiationCommandService } from './negotiation-command.service';
import { NegotiationQueryService } from './negotiation-query.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly commands: NegotiationCommandService,
    private readonly queries: NegotiationQueryService,
  ) {}

  create(data: CreateTransactionDto) {
    return this.commands.propose(data);
  }

  findAll() {
    return this.queries.findAll();
  }

  findOne(id: number) {
    return this.queries.findOne(id);
  }

  update(id: number, data: UpdateTransactionDto) {
    return this.commands.counterPropose(id, data);
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
}
