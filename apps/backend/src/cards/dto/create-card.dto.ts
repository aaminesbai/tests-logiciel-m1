import { IsInt, IsString, IsOptional, MinLength } from 'class-validator';

export class CreateCardDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  category: string;

  @IsString()
  imageUrl: string;

  @IsInt()
  ownerId: number;

  @IsOptional()
  @IsInt()
  senderTransactionId?: number;

  @IsOptional()
  @IsInt()
  receiverTransactionId?: number;
}
