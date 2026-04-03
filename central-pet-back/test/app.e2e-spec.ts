import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { HealthController } from './../src/modules/health/health.controller';
import { UsersController } from './../src/modules/users/users.controller';

describe('App (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let healthController: HealthController;
  let usersController: UsersController;

  beforeAll(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ??
      'postgresql://test:test@localhost:5432/testdb?schema=public';

    const prismaMock: Pick<PrismaService, '$connect'> = {
      $connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };

    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    healthController = moduleFixture.get(HealthController);
    usersController = moduleFixture.get(UsersController);
  });

  afterAll(async () => {
    await app.close();
    await moduleFixture.close();
  });

  it('/api/health (GET)', () => {
    const body = healthController.check() as {
      status: string;
      service: string;
      timestamp: string;
    };

    expect(body.status).toBe('ok');
    expect(body.service).toBe('central-pet-back');
    expect(body.timestamp).toBeDefined();
  });

  it('/api/users (POST) and /api/auth/login (POST)', async () => {
    await usersController.create({
      fullName: 'Maria Silva',
      email: 'maria@example.com',
      password: 'Senha123!',
      role: 'ADOTANTE',
      birthDate: '1995-05-10',
      cpf: '12345678901',
    });

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'maria@example.com',
        password: 'Senha123!',
      })
      .expect(201);

    expect(response.body.message).toBe('Login successful');
    expect(response.body.data.user.email).toBe('maria@example.com');
    // Verify sessionId is NOT exposed in response body (sanitized by interceptor)
    expect(response.body.data.sessionId).toBeUndefined();
    // Verify cookie is set via Set-Cookie header
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'][0]).toContain('central_pet_session=');
  });
});