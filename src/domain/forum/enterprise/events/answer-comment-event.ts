import { DomainEvent } from '@/core/events/domain-event';
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment';

export class AnswerCommentEvent implements DomainEvent {
  public ocurredAt: Date;
  public answerComment: AnswerComment;

  constructor(answerComment: AnswerComment) {
    this.answerComment = answerComment;
    this.ocurredAt = new Date();
  }

  getAggregateId() {
    return this.answerComment.id.toString();
  }
}
