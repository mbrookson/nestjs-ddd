import { EventPublisher } from '../../application/core/event-publisher';
import { DomainEvent } from './domain-event';

type Props = {
  id: any;
};

export abstract class AggregateRoot<TProps extends Props> {
  readonly id: TProps['id'];
  readonly events: DomainEvent[] = [];

  constructor(protected readonly props: TProps) {
    this.id = props.id;
  }

  addEvent(event: DomainEvent) {
    this.events.push(event);
  }

  async publishEvents(publisher: EventPublisher) {
    await publisher.publish(this.events);
    this.events.splice(0, this.events.length);
  }
}
