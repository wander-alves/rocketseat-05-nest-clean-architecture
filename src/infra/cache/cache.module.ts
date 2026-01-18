import { Module } from '@nestjs/common';

import { RedisService } from '@/infra/cache/redis.service';
import { EnvModule } from '@/infra/env/env.module';
import { CacheRepository } from '@/infra/cache/cache-repository';
import { RedisCacheRepository } from '@/infra/cache/redis/redis-cache-repository';

@Module({
  imports: [EnvModule],
  providers: [
    RedisService,
    {
      provide: CacheRepository,
      useClass: RedisCacheRepository,
    },
  ],
  exports: [CacheRepository],
})
export class CacheModule {}
