import { Controller, Post } from '@nestjs/common';
import { CreateUserHandler } from 'src/application/create-user.command';
import { UnitOfWorkProvider } from 'src/infrastructure/unit-of-work.provider';
import { UseTransactionScope } from './core/transaction.interceptor';

@Controller()
export class CreateUserController {
  constructor(
    private readonly unitOfWork: UnitOfWorkProvider,
    private readonly handler: CreateUserHandler,
  ) {}

  @Post('users')
  @UseTransactionScope()
  async createUser() {
    const userId = await this.handler.handle();
    return { userId };
  }
}
