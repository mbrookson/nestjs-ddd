import { randomUUID } from 'crypto';
import { AggregateRoot } from './core/aggregate-root';
import { DomainEvent } from './core/domain-event';

type Props = {
  id: string;
};

export class User extends AggregateRoot<Props> {
  static create() {
    const user = new User({
      id: randomUUID(),
    });
    user.addEvent(new UserCreatedEvent(user.id));
    return user;
  }
}

class UserCreatedEvent extends DomainEvent {
  constructor(readonly id: string) {
    super('user.created', randomUUID());
  }
}
