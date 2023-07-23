import { Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { randomUUID } from 'crypto';
import { AggregateRoot } from './core/aggregate-root';
import { domainEvent } from './core/domain-event';

type Props = {
  id: string;
};

export class User extends AggregateRoot<Props> {
  static create() {
    const user = new User({
      id: randomUUID(),
    });
    user.addEvent(
      new UserCreatedEvent({
        userId: user.id,
        createdAt: new Date(),
      }),
    );
    return user;
  }
}

class UserCreatedPayload {
  @IsString()
  userId: string;

  @Type(() => Date)
  createdAt: Date;
}

export class UserCreatedEvent extends domainEvent<UserCreatedPayload>(
  'user.created',
) {}

export class UserDeletedEvent extends domainEvent<{ userId: string }>(
  'user.deleted',
) {}
