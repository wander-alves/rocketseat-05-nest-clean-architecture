import { CommentOnQuestionUseCase } from '@/domain/forum/application/use-cases/comment-on-question';
import { makeQuestion } from 'tests/factories/make-question';
import { InMemoryQuestionAttachmentsRepository } from 'tests/repositories/in-memory-question-attachments-repository';
import { InMemoryQuestionCommentsRepository } from 'tests/repositories/in-memory-question-comments-repository';
import { InMemoryQuestionsRepository } from 'tests/repositories/in-memory-questions-repository';
import { describe, it, expect, beforeEach } from 'vitest';

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository;
let sut: CommentOnQuestionUseCase;

describe('Comment On Question', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository();
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
    );
    inMemoryQuestionCommentsRepository =
      new InMemoryQuestionCommentsRepository();
    sut = new CommentOnQuestionUseCase(
      inMemoryQuestionsRepository,
      inMemoryQuestionCommentsRepository,
    );
  });

  it('should be able to comment on question', async () => {
    const question = makeQuestion();

    await inMemoryQuestionsRepository.create(question);

    await sut.execute({
      authorId: 'author-01',
      questionId: question.id.toString(),
      content: 'New comment',
    });

    expect(inMemoryQuestionCommentsRepository.items).toHaveLength(1);
    expect(inMemoryQuestionCommentsRepository.items[0]).toMatchObject({
      content: 'New comment',
    });
  });
});
