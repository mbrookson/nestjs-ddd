import { Injectable } from '@nestjs/common';
import { User } from '../domain/user';
import { TransactionProvider } from './transaction.provider';

@Injectable()
export class UserRepository {
  constructor(private prisma: TransactionProvider) {}

  async create(user: User) {
    const prisma = this.prisma.instance;
    await prisma.user.create({
      data: {
        id: user.id,
      },
    });
  }
}
