import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateNegotiationCommentDto } from './dto/create-negotiation-comment.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { NegotiationCommandService } from './negotiation-command.service';
import { NegotiationQueryService } from './negotiation-query.service';

@Controller('negotiations')
export class TransactionsController {
  constructor(
    private readonly commands: NegotiationCommandService,
    private readonly queries: NegotiationQueryService,
  ) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.commands.create(dto);
  }

  @Get()
  findAll() {
    return this.queries.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.queries.findByUser(userId);
  }

  @Get('object/:cardId')
  findByObject(@Param('cardId', ParseIntPipe) cardId: number) {
    return this.queries.findByObject(cardId);
  }

  @Get(':id/history')
  history(@Param('id', ParseIntPipe) id: number) {
    return this.queries.getHistory(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queries.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.commands.update(id, dto);
  }

  @Post(':id/comments')
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateNegotiationCommentDto,
  ) {
    return this.commands.addComment(id, dto);
  }

  @Patch(':id/accept')
  accept(@Param('id', ParseIntPipe) id: number) {
    return this.commands.accept(id);
  }

  @Patch(':id/refuse')
  refuse(@Param('id', ParseIntPipe) id: number) {
    return this.commands.refuse(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.commands.remove(id);
  }
}
