import { describe, beforeAll, test, expect } from 'vitest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import httpClient from 'supertest';

import { AppModule } from '@/infra/app.module';

describe('[E2E] Authenticate Account Controller', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  test('[POST] /accounts', async () => {
    await httpClient(app.getHttpServer()).post('/accounts').send({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'chimichangas',
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
