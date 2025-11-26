import { beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';

const prismaClient = new PrismaClient();

function generateDatabaseURL(schemaID: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing environment variable DATABASE_URL');
  }
  const databaseURL = process.env.DATABASE_URL;
  const url = new URL(databaseURL);

  url.searchParams.set('schema', schemaID);

  return url.toString();
}

const schemaID = randomUUID();
beforeAll(() => {
  const randomDatabaseURL = generateDatabaseURL(schemaID);
  process.env.DATABASE_URL = randomDatabaseURL;

  execSync('npx prisma migrate deploy');
});

afterAll(async () => {
  await prismaClient.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "${schemaID}" CASCADE`,
  );
  await prismaClient.$disconnect();
});
