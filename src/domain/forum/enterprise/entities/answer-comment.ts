import { Optional } from '@/core/types/optional';
import {
  Comment,
  CommentProps,
} from '@/domain/forum/enterprise/entities/comment';
import { AnswerCommentEvent } from '@/domain/forum/enterprise/events/answer-comment-event';

export interface AnswerCommentProps extends CommentProps {
  answerId: string;
}

export class AnswerComment extends Comment<AnswerCommentProps> {
  get answerId() {
    return this.props.answerId;
  }

  static create(props: Optional<AnswerCommentProps, 'createdAt'>, id?: string) {
    const answerComment = new AnswerComment(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    const isAnswerCommentNew = !id;
    if (isAnswerCommentNew) {
      answerComment.addDomainEvent(new AnswerCommentEvent(answerComment));
    }

    return answerComment;
  }
}
