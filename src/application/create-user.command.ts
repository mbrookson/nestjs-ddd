import { Injectable } from '@nestjs/common';
import { User } from '../domain/user';
import { UserRepository } from '../infrastructure/user.repository';
import { EventPublisher } from './core/event-publisher';

@Injectable()
export class CreateUserHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle() {
    const user = User.create();
    await this.userRepository.create(user);
    await user.publishEvents(this.eventPublisher);
    return user.id;
  }
}
