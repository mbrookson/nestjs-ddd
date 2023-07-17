import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TransactionProvider {
  constructor(private cls: ClsService) {}

  get instance() {
    return this.cls.get<Prisma.TransactionClient>('tx');
  }
}
