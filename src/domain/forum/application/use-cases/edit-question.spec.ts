import { EditQuestionUseCase } from '@/domain/forum/application/use-cases/edit-question';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { makeQuestionAttachment } from 'tests/factories/make-question-attachment';
import { makeQuestion } from 'tests/factories/make-question';
import { InMemoryQuestionAttachmentsRepository } from 'tests/repositories/in-memory-question-attachments-repository';
import { InMemoryQuestionsRepository } from 'tests/repositories/in-memory-questions-repository';
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryAttachmentsRepository } from 'tests/repositories/in-memory-attachments-repository';
import { InMemoryStudentsRepository } from 'tests/repositories/in-memory-student-repository';

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let sut: EditQuestionUseCase;

describe('Edit Question', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository();
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
      inMemoryAttachmentsRepository,
      inMemoryStudentsRepository,
    );
    sut = new EditQuestionUseCase(
      inMemoryQuestionsRepository,
      inMemoryQuestionAttachmentsRepository,
    );
  });

  it('should be able to edit a question', async () => {
    const newQuestion = makeQuestion(
      {
        authorId: 'author-01',
      },
      'question-01',
    );

    inMemoryQuestionsRepository.create(newQuestion);
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
      title: 'Example title',
      content: 'New content',
      attachmentIds: ['1', '3'],
    });

    expect(inMemoryQuestionsRepository.items[0]).toMatchObject({
      title: 'Example title',
      content: 'New content',
    });
    expect(
      inMemoryQuestionsRepository.items[0].attachments.currentItems,
    ).toHaveLength(2);
    expect(
      inMemoryQuestionsRepository.items[0].attachments.currentItems,
    ).toEqual([
      expect.objectContaining({ attachmentId: '1' }),
      expect.objectContaining({ attachmentId: '3' }),
    ]);
    expect(
      inMemoryQuestionsRepository.items[0].attachments.getRemovedItems(),
    ).toEqual([expect.objectContaining({ attachmentId: '2' })]);
  });

  it('should not be able to edit questions from another author', async () => {
    const newQuestion = makeQuestion(
      {
        authorId: 'author-01',
      },
      'question-01',
    );

    inMemoryQuestionsRepository.create(newQuestion);

    const result = await sut.execute({
      questionId: 'question-01',
      authorId: 'author-02',
      title: 'New title',
      content: 'Have I done that before',
      attachmentIds: [],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should sync new and removed attachment when editing a question', async () => {
    const newQuestion = makeQuestion(
      {
        authorId: 'author-01',
      },
      'question-01',
    );

    inMemoryQuestionsRepository.create(newQuestion);
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

    const result = await sut.execute({
      questionId: 'question-01',
      authorId: 'author-01',
      title: 'Example title',
      content: 'New content',
      attachmentIds: ['1', '3'],
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryQuestionAttachmentsRepository.items).toHaveLength(2);
    expect(inMemoryQuestionAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attachmentId: '1',
        }),
        expect.objectContaining({
          attachmentId: '3',
        }),
      ]),
    );
  });
});
