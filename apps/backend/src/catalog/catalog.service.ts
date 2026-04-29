import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const userSelect = {
  id: true,
  email: true,
  username: true,
  cards: {
    orderBy: { id: 'asc' as const },
  },
};

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  findUsers() {
    return this.prisma.user.findMany({
      select: userSelect,
      orderBy: { id: 'asc' },
    });
  }

  async findUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }
}
