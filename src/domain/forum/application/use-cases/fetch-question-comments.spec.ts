import { describe, it, expect, beforeEach } from 'vitest';

import { FetchQuestionCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-question-comments';
import { InMemoryQuestionCommentsRepository } from 'tests/repositories/in-memory-question-comments-repository';
import { makeQuestionComment } from 'tests/factories/make-question-comment';

let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository;
let sut: FetchQuestionCommentsUseCase;

describe('Fetch Question Comments', () => {
  beforeEach(() => {
    inMemoryQuestionCommentsRepository =
      new InMemoryQuestionCommentsRepository();
    sut = new FetchQuestionCommentsUseCase(inMemoryQuestionCommentsRepository);
  });

  it('should be able to fetch question comments', async () => {
    await inMemoryQuestionCommentsRepository.create(
      makeQuestionComment({ questionId: 'question-1' }),
    );

    await inMemoryQuestionCommentsRepository.create(
      makeQuestionComment({ questionId: 'question-1' }),
    );

    const result = await sut.execute({
      questionId: 'question-1',
      page: 1,
    });

    expect(result.value?.questionComments).toHaveLength(2);
  });

  it('should be able to fetch paginated question comments', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryQuestionCommentsRepository.create(
        makeQuestionComment({ questionId: 'question-1' }),
      );
    }
    const result = await sut.execute({
      questionId: 'question-1',
      page: 2,
    });

    expect(result.value?.questionComments).toHaveLength(2);
  });
});
