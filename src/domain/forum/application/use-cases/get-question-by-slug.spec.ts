import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryQuestionsRepository } from 'tests/repositories/in-memory-questions-repository';
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug';
import { makeQuestion } from 'tests/factories/make-question';
import { InMemoryQuestionAttachmentsRepository } from 'tests/repositories/in-memory-question-attachments-repository';

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let sut: GetQuestionBySlugUseCase;

describe('Get Question By Slug', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository();
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
    );
    sut = new GetQuestionBySlugUseCase(inMemoryQuestionsRepository);
  });

  it('should be able to get a question by slug', async () => {
    const newQuestion = makeQuestion({
      slug: Slug.create('new-question'),
    });

    inMemoryQuestionsRepository.create(newQuestion);

    const result = await sut.execute({
      slug: 'new-question',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      question: expect.objectContaining({
        id: newQuestion.id,
        slug: newQuestion.slug,
      }),
    });
  });
});
