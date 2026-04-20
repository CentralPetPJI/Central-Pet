import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { HealthController } from '@/modules/health/health.controller';
import { UsersController } from '@/modules/users/users.controller';
import { TestDatabaseHelper } from './helpers/test-database.helper';
import { login } from './helpers/e2e.helper';

describe('App (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let healthController: HealthController;
  let usersController: UsersController;
  let dbHelper: TestDatabaseHelper;

  beforeAll(async () => {
    // Configura banco de dados de teste com schema isolado
    dbHelper = new TestDatabaseHelper();
    await dbHelper.setup();

    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(dbHelper.getClient())
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    healthController = moduleFixture.get(HealthController);
    usersController = moduleFixture.get(UsersController);
  });

  beforeEach(async () => {
    // Limpa dados entre testes
    await dbHelper.cleanup();
  });

  afterAll(async () => {
    await app.close();
    await moduleFixture.close();
    await dbHelper.teardown();
  });

  it('/api/health (GET) deve responder com status de saúde e conexão com banco', async () => {
    const body = await healthController.check();

    expect(body.status).toBe('ok');
    expect(body.service).toBe('central-pet-back');
    expect(body.timestamp).toBeDefined();
    expect(body.database).toBe('connected');
  });

  it('/api/users (POST) e /api/auth/login (POST) devem cadastrar e autenticar usuário', async () => {
    await usersController.create({
      fullName: 'Maria Silva',
      email: 'maria@example.com',
      password: 'Senha123!',
      role: 'PESSOA_FISICA',
      birthDate: new Date('1995-05-10'),
      cpf: '12345678901',
    });

    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await login(httpServer, {
      email: 'maria@example.com',
      password: 'Senha123!',
    });

    const body = response.body as {
      message: string;
      data: {
        user: { email: string };
        sessionId?: string;
      };
    };
    const setCookie = response.headers['set-cookie'] as unknown as string[] | undefined;

    expect(body.message).toBe('Login successful');
    expect(body.data.user.email).toBe('maria@example.com');
    expect(body.data.sessionId).toBeUndefined();
    expect(setCookie).toBeDefined();
    expect(setCookie?.[0]).toContain('central_pet_session=');
  });
});
