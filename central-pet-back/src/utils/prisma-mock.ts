import { jest } from '@jest/globals';

type MockFn = ReturnType<typeof jest.fn>;

export type MockedPrismaClient = {
  user: {
    findFirst: MockFn;
    findUnique: MockFn;
    create: MockFn;
    update: MockFn;
    delete: MockFn;
    findMany: MockFn;
  };
  session: {
    create: MockFn;
    findUnique: MockFn;
    delete: MockFn;
    deleteMany: MockFn;
  };
  pet: {
    findFirst: MockFn;
    findUnique: MockFn;
    create: MockFn;
    update: MockFn;
    delete: MockFn;
    findMany: MockFn;
  };
  adoptionRequest: {
    findFirst: MockFn;
    findUnique: MockFn;
    create: MockFn;
    update: MockFn;
    findMany: MockFn;
  };
  personalityTrait: {
    findMany: MockFn;
  };
  petHistory: {
    create: MockFn;
    findMany: MockFn;
  };
};

export type MockContext = {
  prisma: MockedPrismaClient;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
      session: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      pet: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
      adoptionRequest: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      personalityTrait: {
        findMany: jest.fn(),
      },
      petHistory: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    },
  };
};

export const makePrismaMock = (): MockedPrismaClient => {
  return createMockContext().prisma;
};
