import { beforeEach, describe, expect, it } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { defaultMockUserId, mockUserIds } from '../../mocks/users.mock';
import { MockAuthService } from './mock-auth.service';

describe('MockAuthService', () => {
  let service: MockAuthService;

  beforeEach(() => {
    service = new MockAuthService();
  });

  it('should throw when no mock user header is provided', () => {
    expect(() => service.getCurrentUser()).toThrow(UnauthorizedException);
  });

  it('should return a mock user by id', () => {
    const result = service.getCurrentUser(mockUserIds.RAFAEL_LIMA);

    expect(result.data.user.fullName).toBe('Rafael Lima');
    expect(result.data.user.role).toBe('PESSOA_FISICA');
  });

  it('should list available mock users', () => {
    const result = service.listUsers();

    expect(result.data.users).toHaveLength(5);
    expect(result.data.defaultUserId).toBe(defaultMockUserId);
  });

  it('should expose independent donor users in the mock list', () => {
    const result = service.listUsers();

    expect(result.data.users.find((user) => user.id === mockUserIds.JULIANA_MARTINS)?.role).toBe(
      'PESSOA_FISICA',
    );
  });

  it('should throw when the mock user id does not exist', () => {
    expect(() => service.getCurrentUser('missing-user')).toThrow(UnauthorizedException);
  });
});
