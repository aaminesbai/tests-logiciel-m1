import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        cards: {
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }
}
