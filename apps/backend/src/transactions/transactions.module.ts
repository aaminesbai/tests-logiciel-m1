import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NegotiationCommandService } from './negotiation-command.service';
import { NegotiationQueryService } from './negotiation-query.service';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    NegotiationCommandService,
    NegotiationQueryService,
  ],
})
export class TransactionsModule {}
