import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { setupApp } from '@/bootstrap/setup-app';
import { PrismaService } from '@/prisma/prisma.service';
import { TestDatabaseHelper } from './helpers/test-database.helper';
import { createUser, login, getSessionCookie } from './helpers/e2e.helper';

describe('Security (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let dbHelper: TestDatabaseHelper;

  beforeAll(async () => {
    process.env.THROTTLE_TTL = '60000';
    process.env.THROTTLE_LIMIT = '20';

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
    setupApp(app);

    await app.init();
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

  it('blocks non-whitelisted fields in login payload', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(httpServer)
      .post('/api/auth/login')
      .send({
        email: 'maria@example.com',
        password: 'Senha123!',
        role: 'admin',
      })
      .expect(400);

    const body = response.body as {
      message?: string;
      data?: unknown;
      __clearSessionCookie?: boolean;
    };
    expect(body.message).toContain('property role should not exist');
  });

  it('blocks non-whitelisted fields in user creation payload', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(httpServer)
      .post('/api/users')
      .send({
        fullName: 'Maria Silva',
        email: 'maria@example.com',
        password: 'Senha123!',
        role: 'PESSOA_FISICA',
        cpf: '12345678901',
        passwordHash: 'malicious-field',
      })
      .expect(400);

    const body = response.body as {
      message?: string;
      data?: unknown;
      __clearSessionCookie?: boolean;
    };

    expect(body.message).toContain('property passwordHash should not exist');
  });

  it('enforces authentication for /auth/me without session cookie', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer).get('/api/auth/me').expect(401);
  });

  it('sets secure session cookie attributes and hides sessionId on login', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await createUser(httpServer, {
      fullName: 'Maria Silva',
      email: 'maria@example.com',
      password: 'Senha123!',
      role: 'PESSOA_FISICA',
      cpf: '12345678901',
      acceptTerms: true,
    });

    const response = await login(httpServer, {
      email: 'maria@example.com',
      password: 'Senha123!',
    });

    const setCookie = response.headers['set-cookie'] as unknown as string[] | undefined;

    const body = response.body as {
      message?: string;
      data?: {
        sessionId?: string;
      };
      __clearSessionCookie?: boolean;
    };
    expect(body.data?.sessionId).toBeUndefined();
    expect(setCookie).toBeDefined();
    expect(setCookie?.[0]).toContain('central_pet_session=');
    expect(setCookie?.[0]).toContain('HttpOnly');
    expect(setCookie?.[0]).toContain('SameSite=Lax');
  });

  it('clears session cookie and keeps internal control fields private on logout', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await createUser(httpServer, {
      fullName: 'Joao Santos',
      email: 'joao@example.com',
      password: 'Senha123!',
      role: 'PESSOA_FISICA',
      cpf: '98765432100',
      acceptTerms: true,
    });

    const loginResponse = await login(httpServer, {
      email: 'joao@example.com',
      password: 'Senha123!',
    });

    const sessionCookie = getSessionCookie(loginResponse);

    const response = await request(httpServer)
      .post('/api/auth/logout')
      .set('Cookie', [sessionCookie!])
      .expect(201);

    const setCookie = response.headers['set-cookie'] as unknown as string[] | undefined;

    const body = response.body as {
      message?: string;
      data?: unknown;
      __clearSessionCookie?: boolean;
    };
    expect(body.__clearSessionCookie).toBeUndefined();
    expect(setCookie).toBeDefined();
    expect(setCookie?.[0]).toContain('central_pet_session=;');
    expect(setCookie?.[0]).toContain('HttpOnly');
  });

  it('returns security headers managed by helmet', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(httpServer).get('/api/health').expect(200);

    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('enforces rate limiting after excessive requests', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    let hasRateLimited = false;

    for (let index = 0; index < 80; index += 1) {
      const response = await request(httpServer).get('/api/health');

      if (response.status === 429) {
        hasRateLimited = true;
        break;
      }
    }

    expect(hasRateLimited).toBe(true);
  });
});
