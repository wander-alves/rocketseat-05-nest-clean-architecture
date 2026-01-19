import { describe, beforeAll, it, expect } from 'vitest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { StudentFactory } from 'tests/factories/make-student';
import { QuestionFactory } from 'tests/factories/make-question';
import { AttachmentFactory } from 'tests/factories/make-attachment';
import { QuestionAttachmentFactory } from 'tests/factories/make-question-attachment';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { CacheRepository } from '@/infra/cache/cache-repository';
import { CacheModule } from '@/infra/cache/cache.module';

describe('[E2E] Prisma Questions Repository', () => {
  let app: INestApplication;
  let questionsRepository: QuestionsRepository;
  let cacheRepository: CacheRepository;
  let studentFactory: StudentFactory;
  let attachmentFactory: AttachmentFactory;
  let questionAttachmentFactory: QuestionAttachmentFactory;
  let questionFactory: QuestionFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, CacheModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AttachmentFactory,
        QuestionAttachmentFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    cacheRepository = moduleRef.get(CacheRepository);
    questionsRepository = moduleRef.get(QuestionsRepository);
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    attachmentFactory = moduleRef.get(AttachmentFactory);
    questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory);

    await app.init();
  });

  it('should cache question details', async () => {
    const user = await studentFactory.makePrismaStudent();

    const attachment = await attachmentFactory.makePrismaAttachment();

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id.toString(),
    });

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      questionId: question.id.toString(),
      attachmentId: attachment.id.toString(),
    });

    const slug = question.slug.value;
    await questionsRepository.findDetailsBySlug(slug);

    const cached = await cacheRepository.get(`question:${slug}:details`);
    if (!cached) {
      throw new Error();
    }

    expect(JSON.parse(cached)).toMatchObject({
      id: question.id.toString(),
    });
  });

  it('should return cached question details on subsequent calls', async () => {
    const user = await studentFactory.makePrismaStudent();

    const attachment = await attachmentFactory.makePrismaAttachment();

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id.toString(),
    });

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      questionId: question.id.toString(),
      attachmentId: attachment.id.toString(),
    });

    const slug = question.slug.value;

    let cached = await cacheRepository.get(slug);

    expect(cached).toBeNull();
    await questionsRepository.findDetailsBySlug(slug);

    const questionDetails = await questionsRepository.findDetailsBySlug(slug);

    cached = await cacheRepository.get(`question:${slug}:details`);

    if (!cached || !questionDetails) {
      throw new Error();
    }

    expect(JSON.parse(cached)).toMatchObject({
      id: questionDetails.questionId,
    });
  });

  it('should reset question details cache when saving the question', async () => {
    const user = await studentFactory.makePrismaStudent();

    const attachment = await attachmentFactory.makePrismaAttachment();

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id.toString(),
    });

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      questionId: question.id.toString(),
      attachmentId: attachment.id.toString(),
    });

    const slug = question.slug.value;

    await cacheRepository.set(
      `question:${slug}:details`,
      JSON.stringify({ test: true }),
    );

    await questionsRepository.save(question);

    const cached = await cacheRepository.get(slug);

    expect(cached).toBeNull();
  });
});
