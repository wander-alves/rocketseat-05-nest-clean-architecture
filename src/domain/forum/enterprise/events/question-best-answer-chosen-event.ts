import { DomainEvent } from '@/core/events/domain-event';
import { Question } from '@/domain/forum/enterprise/entities/question';

export class QuestionBestAnswerChosenEvent implements DomainEvent {
  public ocurredAt: Date;
  public question: Question;
  public bestAnswerId: string;

  constructor(question: Question, bestAnswerId: string) {
    this.bestAnswerId = bestAnswerId;
    this.question = question;
    this.ocurredAt = new Date();
  }

  getAggregateId(): string {
    return this.question.id.toString();
  }
}
