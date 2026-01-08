import { describe, it, expect, beforeEach } from 'vitest';

import { FetchQuestionCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-question-comments';
import { InMemoryQuestionCommentsRepository } from 'tests/repositories/in-memory-question-comments-repository';
import { makeQuestionComment } from 'tests/factories/make-question-comment';
import { InMemoryStudentsRepository } from 'tests/repositories/in-memory-student-repository';
import { makeStudent } from 'tests/factories/make-student';

let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: FetchQuestionCommentsUseCase;

describe('Fetch Question Comments', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    inMemoryQuestionCommentsRepository = new InMemoryQuestionCommentsRepository(
      inMemoryStudentsRepository,
    );
    sut = new FetchQuestionCommentsUseCase(inMemoryQuestionCommentsRepository);
  });

  it('should be able to fetch question comments', async () => {
    const student = makeStudent({ name: 'John Doe' });
    inMemoryStudentsRepository.items.push(student);

    const comment1 = makeQuestionComment({
      questionId: 'question-1',
      authorId: student.id.toString(),
    });
    const comment2 = makeQuestionComment({
      questionId: 'question-1',
      authorId: student.id.toString(),
    });
    const comment3 = makeQuestionComment({
      questionId: 'question-1',
      authorId: student.id.toString(),
    });

    await inMemoryQuestionCommentsRepository.create(comment1);
    await inMemoryQuestionCommentsRepository.create(comment2);
    await inMemoryQuestionCommentsRepository.create(comment3);

    const result = await sut.execute({
      questionId: 'question-1',
      page: 1,
    });

    expect(result.isRight()).toBeTruthy();
    expect(result.value?.questionComments).toHaveLength(3);
    expect(result.value?.questionComments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          commentId: comment1.id.toString(),
          authorName: 'John Doe',
        }),
        expect.objectContaining({
          commentId: comment2.id.toString(),
          authorName: 'John Doe',
        }),
        expect.objectContaining({
          commentId: comment3.id.toString(),
          authorName: 'John Doe',
        }),
      ]),
    );
  });

  it('should be able to fetch paginated question comments', async () => {
    const student = makeStudent();
    inMemoryStudentsRepository.items.push(student);
    for (let i = 1; i <= 22; i++) {
      await inMemoryQuestionCommentsRepository.create(
        makeQuestionComment({
          questionId: 'question-1',
          authorId: student.id.toString(),
        }),
      );
    }
    const result = await sut.execute({
      questionId: 'question-1',
      page: 2,
    });

    expect(result.value?.questionComments).toHaveLength(2);
  });
});
