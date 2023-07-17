import { Injectable, Logger } from '@nestjs/common';
import { DomainEvent } from '../../domain/core/domain-event';
import { TransactionProvider } from '../../infrastructure/transaction.provider';

@Injectable()
export class EventPublisher {
  constructor(private logger: Logger, private prisma: TransactionProvider) {}

  async publish(events: DomainEvent[]) {
    this.logger.log(`Publishing ${events.length} events`);
    await this.prisma.instance.domainEvent.createMany({
      data: events.map((event) => ({
        id: event.eventId,
        type: event.eventType,
        data: JSON.stringify(event),
      })),
    });
  }
}
