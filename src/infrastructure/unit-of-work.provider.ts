import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { PrismaProvider } from './prisma.provider';

type TransactionFn = Parameters<PrismaClient['$transaction']>[0];
type TransactionOptions = Parameters<PrismaClient['$transaction']>[1];

@Injectable()
export class UnitOfWorkProvider {
  constructor(
    private readonly prisma: PrismaProvider,
    private readonly cls: ClsService,
  ) {}

  async begin(fn: TransactionFn, options?: TransactionOptions) {
    return await this.prisma.$transaction((tx) => {
      this.cls.set('tx', tx);
      return fn(tx);
    }, options);
  }
}
