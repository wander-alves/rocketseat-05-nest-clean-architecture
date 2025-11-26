import { DomainEvent } from '@/core/events/domain-event';
import { Answer } from '@/domain/forum/enterprise/entities/answer';

export class AnswerCreatedEvent implements DomainEvent {
  public ocurredAt: Date;
  public answer: Answer;

  constructor(answer: Answer) {
    this.answer = answer;
    this.ocurredAt = new Date();
  }

  getAggregateId() {
    return this.answer.id.toString();
  }
}
