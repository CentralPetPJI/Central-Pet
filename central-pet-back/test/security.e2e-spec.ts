import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/bootstrap/setup-app';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersService } from '../src/modules/users/users.service';

describe('Security (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  const publicUser = {
    id: 'user-1',
    fullName: 'Maria Silva',
    email: 'maria@example.com',
    role: 'PESSOA_FISICA' as const,
    birthDate: '1995-05-10',
    cpf: '12345678901',
    organizationName: null,
    cnpj: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const prismaMock: Pick<PrismaService, '$connect'> = {
    $connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };

  const authServiceMock: Pick<AuthService, 'login' | 'logout' | 'getAuthenticatedUser'> = {
    login: jest.fn(async () => ({
      message: 'Login successful',
      data: {
        sessionId: 'session-test-id',
        user: publicUser,
      },
    })),
    logout: jest.fn(async () => ({
      message: 'Logout successful',
    })),
    getAuthenticatedUser: jest.fn(async (sessionId?: string | null) => {
      if (!sessionId) {
        throw new UnauthorizedException('Authentication required');
      }

      return {
        message: 'Authenticated user retrieved successfully',
        data: {
          user: publicUser,
        },
      };
    }),
  };

  const usersServiceMock: Pick<UsersService, 'create'> = {
    create: jest.fn(async () => ({
      message: 'User created successfully',
      data: publicUser,
    })),
  };

  beforeAll(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/testdb?schema=public';
    process.env.THROTTLE_TTL = '60000';
    process.env.THROTTLE_LIMIT = '20';

    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideProvider(AuthService)
      .useValue(authServiceMock)
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await moduleFixture.close();
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

    expect(response.body.message).toContain('property role should not exist');
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

    expect(response.body.message).toContain('property passwordHash should not exist');
  });

  it('enforces authentication for /auth/me without session cookie', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer).get('/api/auth/me').expect(401);
  });

  it('sets secure session cookie attributes and hides sessionId on login', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(httpServer)
      .post('/api/auth/login')
      .send({
        email: 'maria@example.com',
        password: 'Senha123!',
      })
      .expect(201);

    const rawSetCookie = response.headers['set-cookie'];
    const setCookie =
      rawSetCookie === undefined
        ? undefined
        : Array.isArray(rawSetCookie)
          ? rawSetCookie
          : [rawSetCookie];

    expect(response.body.data.sessionId).toBeUndefined();
    expect(setCookie).toBeDefined();
    expect(setCookie?.[0]).toContain('central_pet_session=');
    expect(setCookie?.[0]).toContain('HttpOnly');
    expect(setCookie?.[0]).toContain('SameSite=Lax');
  });

  it('clears session cookie and keeps internal control fields private on logout', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(httpServer)
      .post('/api/auth/logout')
      .set('Cookie', ['central_pet_session=session-test-id'])
      .expect(201);

    const rawSetCookie = response.headers['set-cookie'];
    const setCookie =
      rawSetCookie === undefined
        ? undefined
        : Array.isArray(rawSetCookie)
          ? rawSetCookie
          : [rawSetCookie];

    expect(response.body.__clearSessionCookie).toBeUndefined();
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
