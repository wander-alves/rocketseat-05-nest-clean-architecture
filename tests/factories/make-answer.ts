import { faker } from '@faker-js/faker';

import {
  Answer,
  AnswerProps,
} from '@/domain/forum/enterprise/entities/answer';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export function makeAnswer(override?: Partial<AnswerProps>, id?: string) {
  const answer = Answer.create(
    {
      questionId: new UniqueEntityID().toString(),
      authorId: new UniqueEntityID().toString(),
      content: faker.lorem.text(),
      ...override,
    },
    id,
  );

  return answer;
}
