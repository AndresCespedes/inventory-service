import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    exposedHeaders: 'x-api-key',
    credentials: true,
  });

  // Habilitar validación automática con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no decoradas
      forbidNonWhitelisted: true, // Rechaza propiedades no esperadas
      transform: true, // Transforma automáticamente los tipos
    }),
  );

  // Registrar filtro global de excepciones
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Inventory Service')
    .setDescription('API para gestionar inventarios')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'API-KEY')
    .addTag('inventory', 'Endpoints de gestión de inventario')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001);
}
bootstrap();
