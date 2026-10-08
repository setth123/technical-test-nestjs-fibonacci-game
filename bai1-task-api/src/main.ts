import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // whitelist: loại bỏ field lạ, transform: chuyển body thành instance của DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder().setTitle('Task API').setVersion('1.0').build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(3000);
  console.log('Server: http://localhost:3000 - Swagger: http://localhost:3000/docs');
}
bootstrap();
