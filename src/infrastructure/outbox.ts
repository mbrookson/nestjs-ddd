import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DomainEvent } from '@prisma/client';
import { PrismaProvider } from './prisma.provider';

@Injectable()
export class Outbox {
  constructor(
    private readonly prisma: PrismaProvider,
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

  private async publish(event: DomainEvent) {
    this.logger.debug(`Publishing event`, { event });

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
