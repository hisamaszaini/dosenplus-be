import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as express from 'express';
import { join } from 'path';
import { cwd } from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use('/uploads', express.static(join(cwd(), 'uploads')));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
