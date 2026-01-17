import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {

  const logger = new Logger('main-empresoftperu')

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('sistema/api/v1')

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => {
      const formattedErrors = errors.map((error) => ({
        field: error.property,
        error: error.constraints ? Object.values(error.constraints) : [],
      }));
      return new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: formattedErrors,
      });
    },
  }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }))

  const config = new DocumentBuilder()
    .setTitle('EMPRESOFT PERU SAC')
    .setDescription('APIs para EMPRESOFT PERU SAC')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  app.enableCors({
    origin: [envs.baseFrontendUrl],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });   

  await app.listen(envs.port ?? 3002);
  logger.log(`Allowed CORS origin: ${envs.baseFrontendUrl}`);
  logger.log(`Main empresoftperu running on port ${envs.port}`);
}

bootstrap();