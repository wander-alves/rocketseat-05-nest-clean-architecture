import { describe, beforeAll, test, expect } from 'vitest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import httpClient from 'supertest';

import { AppModule } from '@/infra/app.module';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '@/infra/database/database.module';
import { StudentFactory } from 'tests/factories/make-student';
import { QuestionFactory } from 'tests/factories/make-question';
import { AnswerFactory } from 'tests/factories/make-answer';

describe('[E2E] Fetch Answer Questions Controller', () => {
  let app: INestApplication;
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
    jwt = moduleRef.get(JwtService);
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    answerFactory = moduleRef.get(AnswerFactory);

    await app.init();
  });

  test('[GET] /questions/:questionId/answers', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id.toString(),
    });

    await Promise.all([
      answerFactory.makePrismaAnswer({
        questionId: question.id.toString(),
        content: 'first answer',
        authorId: user.id.toString(),
      }),
      answerFactory.makePrismaAnswer({
        questionId: question.id.toString(),
        content: 'last answer',
        authorId: user.id.toString(),
      }),
    ]);

    const response = await httpClient(app.getHttpServer())
      .get(`/questions/${question.id.toString()}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      answers: expect.arrayContaining([
        expect.objectContaining({ content: 'first answer' }),
        expect.objectContaining({ content: 'last answer' }),
      ]),
    });
  });
});
