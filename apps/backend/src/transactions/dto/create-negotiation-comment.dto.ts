import { IsString } from 'class-validator';

export class CreateNegotiationCommentDto {
  @IsString()
  content!: string;
}
