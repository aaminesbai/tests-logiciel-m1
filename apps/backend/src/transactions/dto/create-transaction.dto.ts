import { IsInt, IsString, IsOptional } from 'class-validator';
import { TransactionStatus } from '../../../generated/prisma/enums';

export class CreateTransactionDto {
  @IsString()
  message!: string;

  @IsInt()
  senderId!: number;

  @IsInt()
  receiverId!: number;

  @IsOptional()
  status?: TransactionStatus;
}
