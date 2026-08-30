import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = new ConfigService();
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

  app.enableShutdownHooks();

  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('EngageQuiz API')
      .setDescription('API de criação e gerenciamento de quizzes')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  if (nodeEnv === 'production') {
    app.enableCors({
      origin: [frontendUrl],
      credentials: true,
    });
  } else {
    app.enableCors();
  }

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.use(helmet());

  await app.listen(configService.get<number>('PORT') ?? 3000);
}
bootstrap();
