import { describe, it, expect, beforeEach } from 'vitest';

import { FetchAnswerCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-answer-comments';
import { InMemoryAnswerCommentsRepository } from 'tests/repositories/in-memory-answer-comments-repository';
import { makeAnswerComment } from 'tests/factories/make-answer-comment';
import { InMemoryStudentsRepository } from 'tests/repositories/in-memory-student-repository';
import { makeStudent } from 'tests/factories/make-student';

let inMemoryStudentsRepository: InMemoryStudentsRepository;
let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository;
let sut: FetchAnswerCommentsUseCase;

describe('Fetch Answer Comments', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository(
      inMemoryStudentsRepository,
    );
    sut = new FetchAnswerCommentsUseCase(inMemoryAnswerCommentsRepository);
  });

  it('should be able to fetch answer comments', async () => {
    const student = makeStudent({ name: 'John Doe' });
    inMemoryStudentsRepository.items.push(student);

    const comment1 = makeAnswerComment({
      answerId: 'answer-1',
      authorId: student.id.toString(),
    });
    const comment2 = makeAnswerComment({
      answerId: 'answer-1',
      authorId: student.id.toString(),
    });
    const comment3 = makeAnswerComment({
      answerId: 'answer-1',
      authorId: student.id.toString(),
    });

    await inMemoryAnswerCommentsRepository.create(comment1);
    await inMemoryAnswerCommentsRepository.create(comment2);
    await inMemoryAnswerCommentsRepository.create(comment3);

    const result = await sut.execute({
      answerId: 'answer-1',
      page: 1,
    });

    expect(result.isRight()).toBeTruthy();
    expect(result.value?.answerComments).toHaveLength(3);
    expect(result.value?.answerComments).toEqual(
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

  it('should be able to fetch paginated answer comments', async () => {
    const student = makeStudent({
      name: 'John Doe',
    });

    inMemoryStudentsRepository.items.push(student);

    for (let i = 1; i <= 22; i++) {
      await inMemoryAnswerCommentsRepository.create(
        makeAnswerComment({
          answerId: 'answer-1',
          authorId: student.id.toString(),
        }),
      );
    }
    const result = await sut.execute({
      answerId: 'answer-1',
      page: 2,
    });

    expect(result.value?.answerComments).toHaveLength(2);
  });
});
