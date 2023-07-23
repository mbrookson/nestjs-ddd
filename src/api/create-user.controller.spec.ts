import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { PrismaProvider } from 'src/infrastructure/prisma.provider';
import { TransactionWrapper } from 'src/infrastructure/prisma/transaction-wrapper';
import { CreateUserController } from './create-user.controller';

describe('AppController', () => {
  let controller: CreateUserController;
  let tx: TransactionWrapper<PrismaClient>;

  beforeEach(async () => {
    const prisma = new PrismaClient();
    tx = new TransactionWrapper(prisma);

    const builder = Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    });

    builder.overrideProvider(PrismaProvider).useValue(tx);

    const app = await builder.compile();

    controller = app.get<CreateUserController>(CreateUserController);

    await tx.startNewTransaction();
  });

  afterEach(async () => {
    await tx.rollbackCurrentTransaction();
  });

  test('can create user', () => {
    expect(controller.createUser()).toBe({ userId: expect.any(String) });
  });
});
