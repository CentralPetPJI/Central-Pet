import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { setupApp } from './bootstrap/setup-app';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);

  logger.log(`Backend running on http://localhost:${port}/api`);
}
void bootstrap();
