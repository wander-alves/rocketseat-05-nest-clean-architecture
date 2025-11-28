import { describe, beforeAll, test, expect } from 'vitest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import httpClient from 'supertest';

import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('[E2E] Fetch Recent Questions Controller', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[GET] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'chimichangas',
      },
    });

    await prisma.question.createMany({
      data: [
        {
          authorId: user.id,
          title: 'Question 01',
          slug: 'question-01',
          content: 'I can ask something here?',
        },
        {
          authorId: user.id,
          title: 'Question 02',
          slug: 'question-02',
          content: 'I can ask something here?',
        },
      ],
    });

    const accessToken = jwt.sign({ sub: user.id });

    const response = await httpClient(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      questions: [
        expect.objectContaining({ slug: 'question-01' }),
        expect.objectContaining({ slug: 'question-02' }),
      ],
    });
  });
});
