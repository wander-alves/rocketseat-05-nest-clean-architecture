import { faker } from '@faker-js/faker';

import {
  QuestionComment,
  type QuestionCommentProps,
} from '@/domain/forum/enterprise/entities/question-comment';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export function makeQuestionComment(
  override?: Partial<QuestionCommentProps>,
  id?: string,
) {
  const questionComment = QuestionComment.create(
    {
      authorId: new UniqueEntityID().toString(),
      questionId: new UniqueEntityID().toString(),
      content: faker.lorem.text(),
      ...override,
    },
    id,
  );

  return questionComment;
}
