import { Controller, Post } from '@nestjs/common';
import { CreateUserHandler } from 'src/application/create-user.command';
import { UseUnitOfWork } from 'src/infrastructure/unit-of-work.decorator';
import { UnitOfWorkProvider } from 'src/infrastructure/unit-of-work.provider';

@Controller()
export class CreateUserController {
  constructor(
    private readonly unitOfWork: UnitOfWorkProvider,
    private readonly handler: CreateUserHandler,
  ) {}

  @Post('users')
  @UseUnitOfWork()
  async createUser() {
    const userId = await this.handler.handle();
    return { userId };
  }
}
