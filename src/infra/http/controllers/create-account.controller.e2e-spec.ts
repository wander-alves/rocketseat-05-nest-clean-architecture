import { describe, beforeAll, test, expect } from 'vitest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import httpClient from 'supertest';

import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

describe('[E2E] Create Account Controller', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  test('[POST] /accounts', async () => {
    const response = await httpClient(app.getHttpServer())
      .post('/accounts')
      .send({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'chimichangas',
      });

    expect(response.statusCode).toBe(201);
    const registeredUser = await prisma.user.findUnique({
      where: {
        email: 'john.doe@example.com',
      },
    });

    expect(registeredUser).toBeTruthy();
  });
});
