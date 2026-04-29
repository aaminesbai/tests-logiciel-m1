import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateCardDto {
  @IsString()
  cardId!: string;

  @IsString()
  name!: string;

  @IsString()
  image!: string;

  @IsString()
  rarity!: string;

  @IsString()
  setId!: string;

  @IsString()
  setName!: string;

  @IsInt()
  hp!: number;

  @IsString()
  types!: string;

  @IsInt()
  ownerId!: number;

  @IsOptional()
  @IsInt()
  senderTransactionId?: number;

  @IsOptional()
  @IsInt()
  receiverTransactionId?: number;
}
