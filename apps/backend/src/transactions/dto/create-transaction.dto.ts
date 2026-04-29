import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class CreateTransactionDto {
  @IsString()
  message!: string;

  @IsInt()
  senderId!: number;

  @IsInt()
  receiverId!: number;

  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  senderCardIds!: number[];

  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  receiverCardIds!: number[];

  @IsOptional()
  status?: TransactionStatus;
}
