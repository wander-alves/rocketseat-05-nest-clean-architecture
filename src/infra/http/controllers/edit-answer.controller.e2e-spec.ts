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
import { AnswerFactory } from 'tests/factories/make-answer';
import { AttachmentFactory } from 'tests/factories/make-attachment';
import { AnswerAttachmentFactory } from 'tests/factories/make-answer-attachment';

describe('[E2E] Edit Answer Controller', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerFactory: AnswerFactory;
  let attachmentFactory: AttachmentFactory;
  let answerAttachmentFactory: AnswerAttachmentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerFactory,
        AttachmentFactory,
        AnswerAttachmentFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    answerFactory = moduleRef.get(AnswerFactory);
    attachmentFactory = moduleRef.get(AttachmentFactory);
    answerAttachmentFactory = moduleRef.get(AnswerAttachmentFactory);

    await app.init();
  });

  test('[PUT] /answers/:id', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id.toString(),
    });

    const attachment1 = await attachmentFactory.makePrismaAttachment();
    const attachment2 = await attachmentFactory.makePrismaAttachment();

    const answer = await answerFactory.makePrismaAnswer({
      questionId: question.id.toString(),
      authorId: user.id.toString(),
    });

    await answerAttachmentFactory.makePrismaAnswerAttachment({
      answerId: answer.id.toString(),
      attachmentId: attachment1.id.toString(),
    });
    await answerAttachmentFactory.makePrismaAnswerAttachment({
      answerId: answer.id.toString(),
      attachmentId: attachment2.id.toString(),
    });

    const attachment3 = await attachmentFactory.makePrismaAttachment();

    const response = await httpClient(app.getHttpServer())
      .put(`/answers/${answer.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Edited answer',
        attachments: [attachment1.id.toString(), attachment3.id.toString()],
      });

    const registeredAnswer = await prisma.answer.findUnique({
      where: {
        id: answer.id.toString(),
      },
    });

    const registeredAnswerAttachments = await prisma.attachment.findMany({
      where: {
        answerId: answer.id.toString(),
      },
    });

    expect(response.statusCode).toBe(204);
    expect(registeredAnswer).toEqual(
      expect.objectContaining({
        content: 'Edited answer',
      }),
    );
    expect(registeredAnswerAttachments).toHaveLength(2);
    expect(registeredAnswerAttachments).toEqual(
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
