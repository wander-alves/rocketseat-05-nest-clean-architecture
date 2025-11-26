import { faker } from '@faker-js/faker';

import {
  AnswerComment,
  AnswerCommentProps,
} from '@/domain/forum/enterprise/entities/answer-comment';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export function makeAnswerComment(
  override?: Partial<AnswerCommentProps>,
  id?: string,
) {
  const answerComment = AnswerComment.create(
    {
      answerId: new UniqueEntityID().toString(),
      authorId: new UniqueEntityID().toString(),
      content: faker.lorem.text(),
      ...override,
    },
    id,
  );

  return answerComment;
}
