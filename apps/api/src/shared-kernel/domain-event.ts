export interface DomainEvent {
  readonly name: string;
  readonly occurredAt: Date;
}

export interface EventBus {
  publish(events: DomainEvent[]): Promise<void>;
}

/** Bus en memoria: suficiente mientras todos los contextos viven en el mismo proceso. */
export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Array<(e: DomainEvent) => Promise<void> | void>>();

  subscribe(name: string, handler: (e: DomainEvent) => Promise<void> | void) {
    this.handlers.set(name, [...(this.handlers.get(name) ?? []), handler]);
  }

  async publish(events: DomainEvent[]) {
    for (const event of events) {
      for (const handler of this.handlers.get(event.name) ?? []) await handler(event);
    }
  }
}
