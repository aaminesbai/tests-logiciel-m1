import { IsInt, IsString } from 'class-validator';

export class CreateNegotiationCommentDto {
  @IsString()
  content!: string;
  @IsInt()
  userId!: number;
}
