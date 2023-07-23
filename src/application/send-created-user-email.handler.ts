import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from 'src/domain/user';

@EventsHandler(UserCreatedEvent)
export class SendCreatedUserEmailHandler
  implements IEventHandler<UserCreatedEvent>
{
  async handle(event: UserCreatedEvent) {
    console.log('SendCreatedUserEmailHandler', event);
  }
}
