import { describe, it, expect, beforeEach } from 'vitest';
import { AnswerQuestionUseCase } from './answer-question';
import { InMemoryAnswersRepository } from 'tests/repositories/in-memory-answers-repository';
import { InMemoryAnswerAttachmentsRepository } from 'tests/repositories/in-memory-answer-attachments-repository';

let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let inMemoryAnswersRepository: InMemoryAnswersRepository;
let sut: AnswerQuestionUseCase;

describe('Answer Question', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository();
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    );
    sut = new AnswerQuestionUseCase(inMemoryAnswersRepository);
  });

  it('should be able to answer a question', async () => {
    const result = await sut.execute({
      questionId: '1',
      authorId: '1',
      content: 'New answer',
      attachmentIds: ['1', '2'],
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.answer.content).toEqual('New answer');
    expect(
      inMemoryAnswersRepository.items[0].attachments.currentItems,
    ).toHaveLength(2);
    expect(inMemoryAnswersRepository.items[0].attachments.currentItems).toEqual(
      [
        expect.objectContaining({ attachmentId: '1' }),
        expect.objectContaining({ attachmentId: '2' }),
      ],
    );
  });

  it('should persist answer attachments when creating a new answer', async () => {
    const result = await sut.execute({
      authorId: '1',
      questionId: '1',
      content: 'I have a answer',
      attachmentIds: ['1', '2'],
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryAnswerAttachmentsRepository.items).toHaveLength(2);
    expect(inMemoryAnswerAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attachmentId: '1',
        }),
        expect.objectContaining({
          attachmentId: '2',
        }),
      ]),
    );
  });
});
