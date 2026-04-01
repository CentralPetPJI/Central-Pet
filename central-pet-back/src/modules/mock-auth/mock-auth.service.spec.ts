import { beforeEach, describe, expect, it } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { MockAuthService } from './mock-auth.service';

describe('MockAuthService', () => {
  let service: MockAuthService;

  beforeEach(() => {
    service = new MockAuthService();
  });

  it('should return the default mock user when no header is provided', () => {
    const result = service.getCurrentUser();

    expect(result.data.user.id).toBe('11111111-1111-1111-1111-111111111111');
    expect(result.data.user.role).toBe('ONG');
  });

  it('should return a mock user by id', () => {
    const result = service.getCurrentUser(
      'c6d69776-cfdc-497a-a7c6-c89e42f2a002',
    );

    expect(result.data.user.fullName).toBe('Rafael Lima');
    expect(result.data.user.role).toBe('ADOTANTE');
  });

  it('should list available mock users', () => {
    const result = service.listUsers();

    expect(result.data.users).toHaveLength(5);
    expect(result.data.defaultUserId).toBe(
      '11111111-1111-1111-1111-111111111111',
    );
  });

  it('should expose independent donor users in the mock list', () => {
    const result = service.listUsers();

    expect(
      result.data.users.find(
        (user) => user.id === '33333333-3333-3333-3333-333333333333',
      )?.role,
    ).toBe('DOADOR_INDEPENDENTE');
  });

  it('should throw when the mock user id does not exist', () => {
    expect(() => service.getCurrentUser('missing-user')).toThrow(
      NotFoundException,
    );
  });
});
