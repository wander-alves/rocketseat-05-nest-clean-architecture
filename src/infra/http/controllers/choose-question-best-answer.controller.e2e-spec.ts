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

describe('[E2E] Choose Qeustion Best Answer Controller', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerFactory: AnswerFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AnswerFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    answerFactory = moduleRef.get(AnswerFactory);

    await app.init();
  });

  test('[PATCH] /answers/:id/choose-as-best', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id.toString(),
    });

    const answer = await answerFactory.makePrismaAnswer({
      questionId: question.id.toString(),
      authorId: user.id.toString(),
    });

    const response = await httpClient(app.getHttpServer())
      .patch(`/answers/${answer.id.toString()}/choose-as-best`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    const registeredQuestion = await prisma.question.findUnique({
      where: {
        id: question.id.toString(),
      },
    });

    expect(response.statusCode).toBe(204);
    expect(registeredQuestion).toEqual(
      expect.objectContaining({
        bestAnswerId: answer.id.toString(),
      }),
    );
  });
});
