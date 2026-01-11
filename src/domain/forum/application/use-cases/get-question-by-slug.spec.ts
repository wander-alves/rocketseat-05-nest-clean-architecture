import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryQuestionsRepository } from 'tests/repositories/in-memory-questions-repository';
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug';
import { makeQuestion } from 'tests/factories/make-question';
import { InMemoryQuestionAttachmentsRepository } from 'tests/repositories/in-memory-question-attachments-repository';
import { InMemoryAttachmentsRepository } from 'tests/repositories/in-memory-attachments-repository';
import { InMemoryStudentsRepository } from 'tests/repositories/in-memory-student-repository';
import { makeStudent } from 'tests/factories/make-student';
import { makeAttachment } from 'tests/factories/make-attachment';
import { makeQuestionAttachment } from 'tests/factories/make-question-attachment';

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let sut: GetQuestionBySlugUseCase;

describe('Get Question By Slug', () => {
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
    sut = new GetQuestionBySlugUseCase(inMemoryQuestionsRepository);
  });

  it('should be able to get a question by slug', async () => {
    const student = makeStudent({ name: 'John Doe' });
    inMemoryStudentsRepository.items.push(student);

    const attachment = makeAttachment({
      title: 'Attachment 01',
    });

    inMemoryAttachmentsRepository.items.push(attachment);

    const newQuestion = makeQuestion({
      slug: Slug.create('new-question'),
      authorId: student.id.toString(),
    });

    inMemoryQuestionsRepository.create(newQuestion);

    inMemoryQuestionAttachmentsRepository.items.push(
      makeQuestionAttachment({
        attachmentId: attachment.id.toString(),
        questionId: newQuestion.id.toString(),
      }),
    );

    const result = await sut.execute({
      slug: 'new-question',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      question: expect.objectContaining({
        questionId: newQuestion.id.toString(),
        authorName: 'John Doe',
        attachments: [
          expect.objectContaining({
            title: attachment.title,
          }),
        ],
      }),
    });
  });
});
