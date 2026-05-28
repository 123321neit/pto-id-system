import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { loadApiEnv } from './config/env.js';

async function bootstrap(): Promise<void> {
  const env = loadApiEnv();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
    origin: env.CORS_ORIGINS,
  });
  app.enableShutdownHooks();

  await app.listen(env.API_PORT);
}

void bootstrap();
