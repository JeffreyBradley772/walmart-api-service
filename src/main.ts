import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { patchNestJsSwagger, ZodValidationPipe } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  patchNestJsSwagger();

  app.useGlobalPipes(new ZodValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Walmart API Service')
    .setDescription('Walmart API Service')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3111);
}
bootstrap();
