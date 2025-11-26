import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryQuestionsRepository } from 'tests/repositories/in-memory-questions-repository';
import { DeleteQuestionUseCase } from '@/domain/forum/application/use-cases/delete-question';
import { makeQuestion } from 'tests/factories/make-question';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { InMemoryQuestionAttachmentsRepository } from 'tests/repositories/in-memory-question-attachments-repository';
import { makeQuestionAttachment } from 'tests/factories/make-question-attachment';

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let sut: DeleteQuestionUseCase;

describe('Delete Question', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository();
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
    );
    sut = new DeleteQuestionUseCase(inMemoryQuestionsRepository);
  });

  it('should be able to delete a question', async () => {
    const newQuestion = makeQuestion(
      {
        authorId: 'author-01',
      },
      'question-01',
    );

    await inMemoryQuestionsRepository.create(newQuestion);

    inMemoryQuestionAttachmentsRepository.items.push(
      makeQuestionAttachment({
        attachmentId: '1',
        questionId: newQuestion.id.toString(),
      }),
      makeQuestionAttachment({
        attachmentId: '2',
        questionId: newQuestion.id.toString(),
      }),
    );

    await sut.execute({
      questionId: 'question-01',
      authorId: 'author-01',
    });

    expect(inMemoryQuestionsRepository.items).toHaveLength(0);
    expect(inMemoryQuestionAttachmentsRepository.items).toHaveLength(0);
  });

  it('should not be able to delete a question from another author', async () => {
    const newQuestion = makeQuestion(
      {
        authorId: 'author-01',
      },
      'question-01',
    );

    await inMemoryQuestionsRepository.create(newQuestion);

    const result = await sut.execute({
      questionId: 'question-01',
      authorId: 'author-02',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
