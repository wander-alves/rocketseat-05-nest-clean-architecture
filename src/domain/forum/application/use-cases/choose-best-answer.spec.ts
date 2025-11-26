import { ChooseBestAnswerUseCase } from '@/domain/forum/application/use-cases/choose-best-answer';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { makeAnswer } from 'tests/factories/make-answer';
import { makeQuestion } from 'tests/factories/make-question';
import { InMemoryAnswerAttachmentsRepository } from 'tests/repositories/in-memory-answer-attachments-repository';
import { InMemoryAnswersRepository } from 'tests/repositories/in-memory-answers-repository';
import { InMemoryQuestionAttachmentsRepository } from 'tests/repositories/in-memory-question-attachments-repository';
import { InMemoryQuestionsRepository } from 'tests/repositories/in-memory-questions-repository';
import { describe, it, expect, beforeEach } from 'vitest';

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let inMemoryAnswersRepository: InMemoryAnswersRepository;
let sut: ChooseBestAnswerUseCase;

describe('Choose Best Answer', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository();
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
    );
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository();
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    );
    sut = new ChooseBestAnswerUseCase(
      inMemoryQuestionsRepository,
      inMemoryAnswersRepository,
    );
  });

  it('should be able to choose the question best answer', async () => {
    const question = makeQuestion({
      authorId: 'author-01',
    });

    const answer = makeAnswer({
      questionId: question.id.toString(),
    });

    await inMemoryQuestionsRepository.create(question);
    await inMemoryAnswersRepository.create(answer);

    await sut.execute({
      answerId: answer.id.toString(),
      authorId: question.authorId,
    });

    expect(inMemoryQuestionsRepository.items[0].bestAnswerId).toEqual(
      answer.id.toString(),
    );
  });

  it('should not be able to choose another author best question answer', async () => {
    const question = makeQuestion({
      authorId: 'author-01',
    });

    const answer = makeAnswer({
      questionId: question.id.toString(),
    });

    await inMemoryQuestionsRepository.create(question);
    await inMemoryAnswersRepository.create(answer);

    const result = await sut.execute({
      answerId: answer.id.toString(),
      authorId: 'author-02',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
