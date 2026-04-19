import { PrismaClient } from '../../generated/prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export type MockContext = { prisma: DeepMockProxy<PrismaClient> };

export const createMockContext = (): MockContext => {
  const prisma = mockDeep<PrismaClient>();

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
  // Re-apply $transaction mock after reset
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (prismaMock as any).$transaction = jest.fn(
    async (cb: (tx: DeepMockProxy<PrismaClient>) => Promise<unknown>) => {
      return cb(prismaMock);
    },
  );
};
