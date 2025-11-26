import { AggregateRoot } from '@/core/entities/aggregate-root';
import { DomainEvent } from '@/core/events/domain-event';
import { DomainEvents } from '@/core/events/domain-events';
import { describe, it, expect, vi } from 'vitest';

class CustomAggregateEventCreated implements DomainEvent {
  public ocurredAt: Date;
  // eslint-disable-next-line no-use-before-define
  private aggregate: CustomAggregate;

  constructor(aggregate: CustomAggregate) {
    this.aggregate = aggregate;
    this.ocurredAt = new Date();
  }

  public getAggregateId(): string {
    return this.aggregate.id.toString();
  }
}

class CustomAggregate extends AggregateRoot<unknown> {
  static create() {
    const aggregate = new CustomAggregate(null);

    aggregate.addDomainEvent(new CustomAggregateEventCreated(aggregate));

    return aggregate;
  }
}

describe('Domain Events', () => {
  it('should be able to dispatch and listen to domain events', () => {
    const callbackSpy = vi.fn();

    DomainEvents.register(callbackSpy, CustomAggregateEventCreated.name);

    const aggregate = CustomAggregate.create();

    expect(aggregate.domainEvents).toHaveLength(1);

    DomainEvents.dispatchEventsForAggregate(aggregate.id.toString());

    expect(callbackSpy).toHaveBeenCalled();
    expect(aggregate.domainEvents).toHaveLength(0);
  });
});
