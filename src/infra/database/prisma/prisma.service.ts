import { envSchema } from '@/infra/env/env';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const env = envSchema.parse(process.env);
    const databaseURL = new URL(env.DATABASE_URL);
    const schema = databaseURL.searchParams.get('schema');

    const adapter = new PrismaPg(
      {
        connectionString: databaseURL.toString(),
      },
      {
        schema: schema || 'public',
      },
    );

    super({
      log: ['warn', 'error'],
      adapter,
    });
  }

  onModuleInit() {
    return this.$connect();
  }

  onModuleDestroy() {
    return this.$disconnect();
  }
}
