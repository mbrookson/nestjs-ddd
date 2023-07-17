export abstract class DomainEvent {
  constructor(readonly eventType: string, readonly eventId: string) {}
}
