import { createDomainEventParser } from './core/domain-event';
import { UserCreatedEvent, UserDeletedEvent } from './user';

export const eventParsers: Record<
  string,
  ReturnType<typeof createDomainEventParser>
> = {
  'user.created': createDomainEventParser(UserCreatedEvent),
  'user.deleted': createDomainEventParser(UserDeletedEvent),
};
