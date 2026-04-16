import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateNegotiationCommentDto } from './dto/create-negotiation-comment.dto';

@Controller('negotiations')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.transactionsService.findByUser(userId);
  }

  @Get('object/:cardId')
  findByObject(@Param('cardId', ParseIntPipe) cardId: number) {
    return this.transactionsService.findByObject(cardId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.findOne(id);
  }

  @Get(':id/history')
  history(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.history(id);
  }

  @Post(':id/comments')
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
  ) {
    return this.transactionsService.addComment(id, content);
  }

  @Patch(':id/accept')
  accept(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.accept(id);
  }

  @Patch(':id/refuse')
  refuse(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.refuse(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, dto);
  }

  @Post(':id/comments')
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateNegotiationCommentDto,
  ) {
    return this.transactionsService.addComment(id, dto);
  }

  @Patch(':id/accept')
  accept(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.accept(id);
  }

  @Patch(':id/refuse')
  refuse(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.refuse(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.remove(id);
  }
}
