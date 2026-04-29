import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { defaultMockUserId, mockUserIds } from '@/mocks';
import { MockAuthService } from './mock-auth.service';
import { ConfigService } from '@nestjs/config';

describe('Servico de autenticacao mock', () => {
  let service: MockAuthService;

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockReturnValue('1.0.0'),
    } as unknown as jest.Mocked<ConfigService>;
    service = new MockAuthService(configService);
  });

  it('deve lançar erro quando nenhum id de usuario for informado', () => {
    expect(() => service.getCurrentUser()).toThrow(UnauthorizedException);
  });

  it('deve retornar um usuario mock pelo id', () => {
    const result = service.getCurrentUser(mockUserIds.RAFAEL_LIMA);

    expect(result.data.user.fullName).toBe('Rafael Lima');
    expect(result.data.user.role).toBe('PESSOA_FISICA');
  });

  it('deve listar os usuarios mock disponiveis', () => {
    const result = service.listUsers();

    expect(result.data.users).toHaveLength(5);
    expect(result.data.defaultUserId).toBe(defaultMockUserId);
  });

  it('deve expor usuarios independentes na lista mock', () => {
    const result = service.listUsers();

    expect(result.data.users.find((user) => user.id === mockUserIds.JULIANA_MARTINS)?.role).toBe(
      'PESSOA_FISICA',
    );
  });

  it('deve lançar erro quando o id do usuario nao existir', () => {
    expect(() => service.getCurrentUser('missing-user')).toThrow(UnauthorizedException);
  });
});
