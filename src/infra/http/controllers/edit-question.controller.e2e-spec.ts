import { describe, beforeAll, test, expect } from 'vitest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import httpClient from 'supertest';

import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '@/infra/database/database.module';
import { StudentFactory } from 'tests/factories/make-student';
import { QuestionFactory } from 'tests/factories/make-question';
import { AttachmentFactory } from 'tests/factories/make-attachment';
import { QuestionAttachmentFactory } from 'tests/factories/make-question-attachment';

describe('[E2E] Edit Question Controller', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let attachmentFactory: AttachmentFactory;
  let questionAttachmentFactory: QuestionAttachmentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AttachmentFactory,
        QuestionAttachmentFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    attachmentFactory = moduleRef.get(AttachmentFactory);
    questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory);

    await app.init();
  });

  test('[PUT] /questions/:id', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const attachment1 = await attachmentFactory.makePrismaAttachment();
    const attachment2 = await attachmentFactory.makePrismaAttachment();

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id.toString(),
    });

    await questionAttachmentFactory.makePrismaAttachment({
      questionId: question.id.toString(),
      attachmentId: attachment1.id.toString(),
    });
    await questionAttachmentFactory.makePrismaAttachment({
      questionId: question.id.toString(),
      attachmentId: attachment2.id.toString(),
    });

    const attachment3 = await attachmentFactory.makePrismaAttachment();

    const response = await httpClient(app.getHttpServer())
      .put(`/questions/${question.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New Title',
        content: 'New Content',
        attachments: [attachment1.id.toString(), attachment3.id.toString()],
      });

    const registeredQuestion = await prisma.question.findUnique({
      where: {
        id: question.id.toString(),
      },
    });

    const registeredQuestionAttachments = await prisma.attachment.findMany({
      where: {
        questionId: question.id.toString(),
      },
    });

    expect(response.statusCode).toBe(204);
    expect(registeredQuestion).toEqual(
      expect.objectContaining({
        title: 'New Title',
      }),
    );
    expect(registeredQuestionAttachments).toHaveLength(2);
    expect(registeredQuestionAttachments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: attachment1.id.toString(),
        }),
        expect.objectContaining({
          id: attachment3.id.toString(),
        }),
      ]),
    );
  });
});
