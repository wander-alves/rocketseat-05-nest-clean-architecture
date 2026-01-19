import { beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { DomainEvents } from '@/core/events/domain-events';
import Redis from 'ioredis';
import { envSchema } from '@/infra/env/env';

config({ path: '.env', override: true });
config({ path: '.env.test', override: true });

const env = envSchema.parse(process.env);

const prismaClient = new PrismaClient();
const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
});

function generateDatabaseURL(schemaID: string) {
  if (!env.DATABASE_URL) {
    throw new Error('Missing environment variable DATABASE_URL');
  }
  const databaseURL = env.DATABASE_URL;
  const url = new URL(databaseURL);

  url.searchParams.set('schema', schemaID);

  return url.toString();
}

const schemaID = randomUUID();
beforeAll(async () => {
  const randomDatabaseURL = generateDatabaseURL(schemaID);
  process.env.DATABASE_URL = randomDatabaseURL;

  DomainEvents.shouldRun = false;

  await redisClient.flushdb();

  execSync('npx prisma migrate deploy');
});

afterAll(async () => {
  await prismaClient.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "${schemaID}" CASCADE`,
  );
  await prismaClient.$disconnect();
});
