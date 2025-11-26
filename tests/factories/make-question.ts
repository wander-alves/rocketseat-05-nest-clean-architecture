import { faker } from '@faker-js/faker';

import {
  Question,
  type QuestionProps,
} from '@/domain/forum/enterprise/entities/question';
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export function makeQuestion(override?: Partial<QuestionProps>, id?: string) {
  const question = Question.create(
    {
      authorId: new UniqueEntityID().toString(),
      title: faker.lorem.sentence(),
      slug: Slug.create('new-question'),
      content: faker.lorem.text(),
      ...override,
    },
    id,
  );

  return question;
}
