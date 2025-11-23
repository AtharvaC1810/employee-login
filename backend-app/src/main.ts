import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5001",
  "http://localhost:5002",
  "http://localhost:4000",
  "http://localhost:4001",
  "http://localhost:4002",
  "https://vercel.com/atharva-chaudharis-projects-6d5d61e3/employee-login/AtF2syiL9Lt9yBe7pEx8Vrv8vcco"
];
 
  app.enableCors({
    origin: allowedOrigins,  
    credentials: true,
    methods: 'GET,POST,PUT,PATCH,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('Backend running');
}
bootstrap();
