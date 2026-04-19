import { prismaMock, resetPrismaMock } from '@/utils/prisma-mock';

jest.mock('./client', () => ({
  __esModule: true,
  default: prismaMock,
}));

beforeEach(() => {
  resetPrismaMock();
});

export { prismaMock };
