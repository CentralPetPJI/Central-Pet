import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HealthController } from '../src/modules/health/health.controller';
import { UsersController } from '../src/modules/users/users.controller';

describe('App (e2e)', () => {
  type PersistedUser = {
    id: string;
    fullName: string;
    email: string;
    role: 'PESSOA_FISICA' | 'ONG';
    birthDate: string | null;
    cpf: string | null;
    organizationName: string | null;
    cnpj: string | null;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
  };

  type SessionRecord = {
    id: string;
    userId: string;
    createdAt: Date;
  };

  let app: INestApplication;
  let moduleFixture: TestingModule;
  let healthController: HealthController;
  let usersController: UsersController;

  beforeAll(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/testdb?schema=public';

    const users: PersistedUser[] = [];
    const sessions: SessionRecord[] = [];

    const prismaMock = {
      $connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      user: {
        findFirst: jest.fn(
          async ({
            where,
          }: {
            where: { OR: Array<{ email?: string; cpf?: string; cnpj?: string }> };
          }) =>
            users.find((user) =>
              where.OR.some((candidate) => {
                if (candidate.email) return user.email === candidate.email;
                if (candidate.cpf) return user.cpf === candidate.cpf;
                if (candidate.cnpj) return user.cnpj === candidate.cnpj;
                return false;
              }),
            ) ?? null,
        ),
        findUnique: jest.fn(
          async ({
            where,
          }: {
            where: { id?: string; email?: string };
          }) => {
            if (where.email) {
              return users.find((user) => user.email === where.email) ?? null;
            }
            if (where.id) {
              return users.find((user) => user.id === where.id) ?? null;
            }
            return null;
          },
        ),
        create: jest.fn(
          async ({
            data,
          }: {
            data: {
              fullName: string;
              email: string;
              role: 'PESSOA_FISICA' | 'ONG';
              birthDate?: string;
              cpf?: string;
              organizationName?: string;
              cnpj?: string;
              passwordHash: string;
            };
          }) => {
            const createdUser: PersistedUser = {
              id: `user-${users.length + 1}`,
              fullName: data.fullName,
              email: data.email,
              role: data.role,
              birthDate: data.birthDate ?? null,
              cpf: data.cpf ?? null,
              organizationName: data.organizationName ?? null,
              cnpj: data.cnpj ?? null,
              passwordHash: data.passwordHash,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            users.push(createdUser);
            return createdUser;
          },
        ),
      },
      session: {
        create: jest.fn(
          async ({
            data,
          }: {
            data: { userId: string };
          }) => {
            const session: SessionRecord = {
              id: `session-${sessions.length + 1}`,
              userId: data.userId,
              createdAt: new Date(),
            };
            sessions.push(session);
            return session;
          },
        ),
        findUnique: jest.fn(
          async ({
            where,
          }: {
            where: { id: string };
          }) => sessions.find((session) => session.id === where.id) ?? null,
        ),
        delete: jest.fn(
          async ({
            where,
          }: {
            where: { id: string };
          }) => {
            const index = sessions.findIndex((session) => session.id === where.id);
            if (index >= 0) {
              sessions.splice(index, 1);
            }
            return undefined;
          },
        ),
        deleteMany: jest.fn(
          async ({
            where,
          }: {
            where: { id: string };
          }) => {
            const before = sessions.length;
            const filtered = sessions.filter((session) => session.id !== where.id);
            sessions.length = 0;
            sessions.push(...filtered);
            return { count: before - sessions.length };
          },
        ),
      },
    } as unknown as Pick<PrismaService, '$connect' | 'user' | 'session'>;

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

  it('/api/health (GET) deve responder com status de saúde', () => {
    const body = healthController.check() as {
      status: string;
      service: string;
      timestamp: string;
    };

    expect(body.status).toBe('ok');
    expect(body.service).toBe('central-pet-back');
    expect(body.timestamp).toBeDefined();
  });

  it('/api/users (POST) e /api/auth/login (POST) devem cadastrar e autenticar usuário', async () => {
    await usersController.create({
      fullName: 'Maria Silva',
      email: 'maria@example.com',
      password: 'Senha123!',
      role: 'PESSOA_FISICA',
      birthDate: '1995-05-10',
      cpf: '12345678901',
    });

    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(httpServer)
      .post('/api/auth/login')
      .send({
        email: 'maria@example.com',
        password: 'Senha123!',
      })
      .expect(201);

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
    // Verify sessionId is NOT exposed in response body (sanitized by interceptor)
    expect(body.data.sessionId).toBeUndefined();
    // Verify cookie is set via Set-Cookie header
    expect(setCookie).toBeDefined();
    expect(setCookie?.[0]).toContain('central_pet_session=');
  });
});
