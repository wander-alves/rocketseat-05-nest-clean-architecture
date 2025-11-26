import { EditAnswerUseCase } from '@/domain/forum/application/use-cases/edit-answer';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { makeAnswerAttachment } from 'tests/factories/make-answer-attachment';
import { makeAnswer } from 'tests/factories/make-answer';
import { InMemoryAnswerAttachmentsRepository } from 'tests/repositories/in-memory-answer-attachments-repository';
import { InMemoryAnswersRepository } from 'tests/repositories/in-memory-answers-repository';
import { describe, it, expect, beforeEach } from 'vitest';

let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let inMemoryAnswersRepository: InMemoryAnswersRepository;
let sut: EditAnswerUseCase;

describe('Edit Answer', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository();
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    );
    sut = new EditAnswerUseCase(
      inMemoryAnswersRepository,
      inMemoryAnswerAttachmentsRepository,
    );
  });

  it('should be able to edit an answer', async () => {
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
      content: 'Edited content',
      attachmentIds: ['1', '4'],
    });

    expect(inMemoryAnswersRepository.items[0]).toMatchObject({
      content: 'Edited content',
    });
    expect(
      inMemoryAnswersRepository.items[0].attachments.currentItems,
    ).toHaveLength(2);
    expect(inMemoryAnswersRepository.items[0].attachments.currentItems).toEqual(
      [
        expect.objectContaining({ attachmentId: '1' }),
        expect.objectContaining({ attachmentId: '4' }),
      ],
    );
    expect(
      inMemoryAnswersRepository.items[0].attachments.getRemovedItems(),
    ).toEqual([
      expect.objectContaining({ attachmentId: '1' }),
      expect.objectContaining({ attachmentId: '2' }),
    ]);
  });

  it('should not be able to edit an answer from another author', async () => {
    const newAnswer = makeAnswer(
      {
        authorId: 'author-01',
      },
      'answer-01',
    );

    await inMemoryAnswersRepository.create(newAnswer);

    const result = await sut.execute({
      answerId: 'answer-01',
      authorId: 'author-02',
      content: 'Edited content',
      attachmentIds: [],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
