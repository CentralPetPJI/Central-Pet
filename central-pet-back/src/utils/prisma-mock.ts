import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export type MockContext = { prisma: DeepMockProxy<PrismaClient> };

export const createMockContext = (): MockContext => {
  const prisma = mockDeep<PrismaClient>();

  // Ensure auditLog mock exists for tests that expect it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
  if (!(prisma as any).auditLog) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
    (prisma as any).auditLog = {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (prisma as any).$transaction = jest.fn(
    async (cb: (tx: DeepMockProxy<PrismaClient>) => Promise<unknown>) => {
      return cb(prisma);
    },
  );

  return { prisma };
};

export const makePrismaMock = (): DeepMockProxy<PrismaClient> => {
  return createMockContext().prisma;
};

// Singleton mock: re-initialize with the same robust configuration
const sharedMock = createMockContext().prisma;
export const prismaMock = sharedMock;

export const resetPrismaMock = (): void => {
  mockReset(prismaMock);

  // Ensure auditLog mock persists after reset
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
  if (!(prismaMock as any).auditLog) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
    (prismaMock as any).auditLog = {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    };
  }

  // Re-apply $transaction mock after reset
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (prismaMock as any).$transaction = jest.fn(
    async (cb: (tx: DeepMockProxy<PrismaClient>) => Promise<unknown>) => {
      return cb(prismaMock);
    },
  );
};
