import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { EnvService } from '@/infra/env/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const envService: EnvService = app.get(EnvService);
  const port = envService.get('PORT');

  await app.listen(port);
}
bootstrap();
