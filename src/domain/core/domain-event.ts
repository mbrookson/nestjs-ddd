import { ClassConstructor, plainToClass } from 'class-transformer';
import { IsString, validate } from 'class-validator';
import { randomUUID } from 'crypto';

export class DomainEventBase {
  @IsString()
  readonly eventType: string;

  @IsString()
  readonly eventId: string;

  constructor(eventType: string, eventId: string) {
    this.eventType = eventType;
    this.eventId = eventId;
  }
}

export function domainEvent<T>(eventType: string) {
  class DomainEvent extends DomainEventBase {
    static eventType = eventType;

    constructor(readonly payload: T) {
      const eventId = randomUUID();
      super(eventType, eventId);
    }
  }

  return DomainEvent;
}

export async function parseDomainEvent(event: object) {
  const instance = plainToClass(DomainEventBase, event);
  await validate(instance);
  return instance;
}

export function createDomainEventParser<T extends DomainEventBase>(
  ctor: ClassConstructor<T>,
) {
  return async function (parsedDomainEvent: DomainEventBase) {
    const instance = plainToClass(ctor, parsedDomainEvent);
    await validate(instance);
    return instance;
  };
}
