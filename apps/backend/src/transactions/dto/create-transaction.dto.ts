import { IsInt, IsString, IsOptional } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class CreateTransactionDto {
  @IsString()
  message: string;

  @IsInt()
  senderId: number;

  @IsInt()
  receiverId: number;

  @IsOptional()
  status?: TransactionStatus;
}
