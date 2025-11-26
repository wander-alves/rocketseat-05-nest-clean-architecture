import { describe, it, expect, beforeEach } from 'vitest';

import { InMemoryAnswersRepository } from 'tests/repositories/in-memory-answers-repository';
import { DeleteAnswerUseCase } from '@/domain/forum/application/use-cases/delete-answer';
import { makeAnswer } from 'tests/factories/make-answer';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { InMemoryAnswerAttachmentsRepository } from 'tests/repositories/in-memory-answer-attachments-repository';
import { makeAnswerAttachment } from 'tests/factories/make-answer-attachment';

let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let inMemoryAnswersRepository: InMemoryAnswersRepository;
let sut: DeleteAnswerUseCase;

describe('Delete Answer', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository();
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    );
    sut = new DeleteAnswerUseCase(inMemoryAnswersRepository);
  });

  it('should be able to delete a answer', async () => {
    const newAnswer = makeAnswer(
      {
        authorId: 'author-01',
      },
      'answer-01',
    );

    inMemoryAnswersRepository.create(newAnswer);
    inMemoryAnswerAttachmentsRepository.items.push(
      makeAnswerAttachment({
        attachmentId: '1',
        answerId: newAnswer.id.toString(),
      }),
      makeAnswerAttachment({
        attachmentId: '2',
        answerId: newAnswer.id.toString(),
      }),
    );

    await sut.execute({
      answerId: 'answer-01',
      authorId: 'author-01',
    });

    expect(inMemoryAnswersRepository.items).toHaveLength(0);
    expect(inMemoryAnswerAttachmentsRepository.items).toHaveLength(0);
  });

  it('should not be able to delete a answer from another author', async () => {
    const newAnswer = makeAnswer(
      {
        authorId: 'author-01',
      },
      'answer-01',
    );

    inMemoryAnswersRepository.create(newAnswer);

    const result = await sut.execute({
      answerId: 'answer-01',
      authorId: 'author-02',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
