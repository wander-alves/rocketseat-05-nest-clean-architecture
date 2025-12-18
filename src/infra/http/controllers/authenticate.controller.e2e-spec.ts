import { describe, beforeAll, test, expect } from 'vitest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import httpClient from 'supertest';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { StudentFactory } from 'tests/factories/make-student';
import { hash } from 'bcryptjs';

describe('[E2E] Authenticate Account Controller', () => {
  let app: INestApplication;
  let studentFactory: StudentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    studentFactory = moduleRef.get(StudentFactory);

    await app.init();
  });

  test('[POST] /accounts', async () => {
    await studentFactory.makePrismaStudent({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: await hash('chimichangas', 8),
    });

    const response = await httpClient(app.getHttpServer())
      .post('/sessions')
      .send({
        email: 'john.doe@example.com',
        password: 'chimichangas',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        access_token: expect.any(String),
      }),
    );
  });
});
