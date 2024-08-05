import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3001', // Cambia esto al origen que necesites permitir
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Habilitar si usas cookies o autenticación
  });

  // Use the ValidationPipe to enable validation globally
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(config.get('server.port'));
}
bootstrap();
