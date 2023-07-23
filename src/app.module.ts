import { Logger, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { ClsModule } from 'nestjs-cls';
import { CreateUserController } from './api/create-user.controller';
import { EventPublisher } from './application/core/event-publisher';
import { CreateUserHandler } from './application/create-user.command';
import { SendCreatedUserEmailHandler } from './application/send-created-user-email.handler';
import { Outbox } from './infrastructure/outbox';
import { PrismaProvider } from './infrastructure/prisma.provider';
import { TransactionProvider } from './infrastructure/transaction.provider';
import { UnitOfWorkProvider } from './infrastructure/unit-of-work.provider';
import { UserRepository } from './infrastructure/user.repository';

@Module({
  imports: [
    CqrsModule,
    ScheduleModule.forRoot(),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          cls.set('userId', req.headers['x-user-id']);
        },
      },
    }),
  ],
  controllers: [CreateUserController],
  providers: [
    Logger,
    PrismaProvider,
    TransactionProvider,
    UnitOfWorkProvider,
    EventPublisher,
    Outbox,
    UserRepository,
    CreateUserHandler,
    SendCreatedUserEmailHandler,
  ],
})
export class AppModule {}
