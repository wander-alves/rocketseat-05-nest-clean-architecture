import { describe, beforeAll, test, expect } from 'vitest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import httpClient from 'supertest';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { JwtService } from '@nestjs/jwt';
import { StudentFactory } from 'tests/factories/make-student';
import { QuestionFactory } from 'tests/factories/make-question';
import { QuestionCommentFactory } from 'tests/factories/make-question-comment';

describe('[E2E] Fetch Question Comments Controller', () => {
  let app: INestApplication;
  let jwt: JwtService;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let questionCommentFactory: QuestionCommentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, QuestionCommentFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    jwt = moduleRef.get(JwtService);
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    questionCommentFactory = moduleRef.get(QuestionCommentFactory);

    await app.init();
  });

  test('[GET] /questions/:questionId/comments', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
    });

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id.toString(),
    });

    const questionId = question.id.toString();
    await Promise.all([
      questionCommentFactory.makePrismaQuestionComment({
        authorId: user.id.toString(),
        questionId,
        content: 'Comment 01',
      }),
      questionCommentFactory.makePrismaQuestionComment({
        authorId: user.id.toString(),
        questionId,
        content: 'Comment 02',
      }),
    ]);

    const response = await httpClient(app.getHttpServer())
      .get(`/questions/${questionId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      comments: expect.arrayContaining([
        expect.objectContaining({
          content: 'Comment 01',
          authorName: 'John Doe',
        }),
        expect.objectContaining({
          content: 'Comment 02',
          authorName: 'John Doe',
        }),
      ]),
    });
  });
});
