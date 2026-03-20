import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateCommentDto) {
    return this.prisma.comment.create({ data });
  }

  findAll() {
    return this.prisma.comment.findMany();
  }

  findOne(id: number) {
    return this.prisma.comment.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateCommentDto) {
    return this.prisma.comment.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.comment.delete({ where: { id } });
  }
}
