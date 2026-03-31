import { Test, TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { HealthController } from './../src/modules/health/health.controller';
import { UsersController } from './../src/modules/users/users.controller';
import { AuthController } from './../src/modules/auth/auth.controller';

describe('App (e2e)', () => {
  let moduleFixture: TestingModule;
  let healthController: HealthController;
  let usersController: UsersController;
  let authController: AuthController;

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

    healthController = moduleFixture.get(HealthController);
    usersController = moduleFixture.get(UsersController);
    authController = moduleFixture.get(AuthController);
  });

  afterAll(async () => {
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

    const responseMock = {
      setHeader: jest.fn<(name: string, value: string) => void>(),
    };

    const loginResponse = await authController.login({
      email: 'maria@example.com',
      password: 'Senha123!',
    });

    expect(loginResponse.message).toBe('Login successful');
    expect(loginResponse.data.user.email).toBe('maria@example.com');
    expect(responseMock.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('central_pet_session='),
    );
  });
});
