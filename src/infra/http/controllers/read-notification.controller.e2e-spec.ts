import { describe, beforeAll, test, expect } from 'vitest';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import httpClient from 'supertest';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { StudentFactory } from 'tests/factories/make-student';
import { NotificationFactory } from 'tests/factories/make-notification';

describe('[E2E] Read Notification Controller', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let studentFactory: StudentFactory;
  let notificationFactory: NotificationFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, NotificationFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);
    studentFactory = moduleRef.get(StudentFactory);
    notificationFactory = moduleRef.get(NotificationFactory);

    await app.init();
  });

  test('[PATCH] /notifications/:notificationId/read', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const notification = await notificationFactory.makePrismaNotification({
      recipientId: user.id.toString(),
    });

    const notificationId = notification.id.toString();

    const response = await httpClient(app.getHttpServer())
      .patch(`/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    const notificationOnDatabase = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    expect(response.statusCode).toBe(204);
    expect(notificationOnDatabase?.readAt).toBeTruthy();
  });
});
