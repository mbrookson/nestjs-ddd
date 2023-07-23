import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DomainEvent } from '@prisma/client';
import { parseDomainEvent } from 'src/domain/core/domain-event';
import { eventParsers } from 'src/domain/events';
import { PrismaProvider } from './prisma.provider';
import { UseUnitOfWork } from './unit-of-work.decorator';

@Injectable()
export class Outbox {
  constructor(
    private readonly prisma: PrismaProvider,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async process() {
    this.logger.verbose(`Processing outbox`);

    const events = await this.prisma.domainEvent.findMany({
      where: {
        publishedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    for (const event of events) {
      await this.publish(event);
    }
  }

  @UseUnitOfWork()
  private async publish(event: DomainEvent) {
    const parsedJson = JSON.parse(event.data);
    const parsedDomainEvent = await parseDomainEvent(parsedJson);
    const parse = eventParsers[parsedDomainEvent.eventType];
    const parsedEvent = await parse(parsedDomainEvent);

    await this.eventBus.publish(parsedEvent);

    await this.prisma.domainEvent.update({
      where: {
        id: event.id,
      },
      data: {
        publishedAt: new Date(),
      },
    });
  }
}
