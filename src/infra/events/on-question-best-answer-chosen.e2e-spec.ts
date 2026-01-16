import { describe, beforeAll, expect, it } from 'vitest';

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
import { DomainEvents } from '@/core/events/domain-events';
import { waitFor } from 'tests/utils/wait-for';

describe('[E2E] On Question Best Answer Chosen', () => {
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

    DomainEvents.shouldRun = true;

    await app.init();
  });

  it('should send a notification when question best answer is chosen', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id.toString(),
    });

    const answer = await answerFactory.makePrismaAnswer({
      questionId: question.id.toString(),
      authorId: user.id.toString(),
    });

    const answerId = answer.id.toString();

    await httpClient(app.getHttpServer())
      .patch(`/answers/${answerId}/choose-as-best`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    await waitFor(async () => {
      const notificationsOnDatabase = await prisma.notification.findFirst({
        where: {
          recipientId: user.id.toString(),
        },
      });

      expect(notificationsOnDatabase).toBeTruthy();
    });
  });
});
