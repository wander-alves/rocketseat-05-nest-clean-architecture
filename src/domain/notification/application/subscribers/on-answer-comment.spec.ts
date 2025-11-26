import { describe, it, beforeEach, expect, vi, MockInstance } from 'vitest';
import { OnAnswerComment } from '@/domain/notification/application/subscribers/on-answer-comment';
import { InMemoryAnswerAttachmentsRepository } from 'tests/repositories/in-memory-answer-attachments-repository';
import { InMemoryAnswersRepository } from 'tests/repositories/in-memory-answers-repository';
import { InMemoryQuestionsRepository } from 'tests/repositories/in-memory-questions-repository';
import { InMemoryQuestionAttachmentsRepository } from 'tests/repositories/in-memory-question-attachments-repository';
import { InMemoryNotificationsRepository } from 'tests/repositories/in-memory-notifications-repository';
import {
  SendNotificationUseCase,
  SendNotificationUseCaseRequest,
  SendNotificationUseCaseResponse,
} from '@/domain/notification/application/use-cases/send-notification';
import { makeAnswer } from 'tests/factories/make-answer';
import { makeQuestion } from 'tests/factories/make-question';
import { waitFor } from 'tests/utils/wait-for';
import { InMemoryAnswerCommentsRepository } from 'tests/repositories/in-memory-answer-comments-repository';
import { makeAnswerComment } from 'tests/factories/make-answer-comment';

let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryAnswersRepository: InMemoryAnswersRepository;
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository;
let inMemoryNotificationsRepository: InMemoryNotificationsRepository;
let sendNotificationUseCase: SendNotificationUseCase;

let sendNotificationExcuteSpy: MockInstance<
  (
    data: SendNotificationUseCaseRequest,
  ) => Promise<SendNotificationUseCaseResponse>
>;

describe.only('On Answer Created', () => {
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

    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository();

    inMemoryNotificationsRepository = new InMemoryNotificationsRepository();
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemoryNotificationsRepository,
    );

    sendNotificationExcuteSpy = vi.spyOn(sendNotificationUseCase, 'execute');
    new OnAnswerComment(
      inMemoryAnswersRepository,
      inMemoryQuestionsRepository,
      sendNotificationUseCase,
    );
  });

  it('should send a notification when an answer is commented', async () => {
    const question = makeQuestion();
    const answer = makeAnswer({
      questionId: question.id.toString(),
    });
    const answerComment = makeAnswerComment({
      answerId: answer.id.toString(),
      authorId: answer.authorId,
    });

    inMemoryQuestionsRepository.create(question);
    inMemoryAnswersRepository.create(answer);
    inMemoryAnswerCommentsRepository.create(answerComment);

    await waitFor(() => {
      expect(sendNotificationExcuteSpy).toHaveBeenCalled();
    });
  });
});
