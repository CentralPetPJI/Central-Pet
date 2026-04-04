import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAuthStrategy } from './factory';
import { JwtAuthStrategy } from '@/lib/auth';
import { MockAuthStrategy } from '@/lib/auth';

describe('createAuthStrategy', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('usa mock auth por padrao', () => {
    const strategy = createAuthStrategy();

    expect(strategy).toBeInstanceOf(MockAuthStrategy);
  });

  it('cria a estrategia JWT quando solicitado', () => {
    vi.stubEnv('VITE_AUTH_STRATEGY', 'jwt');

    const strategy = createAuthStrategy();

    expect(strategy).toBeInstanceOf(JwtAuthStrategy);
  });

  it('cria a estrategia mock quando configurado explicitamente', () => {
    vi.stubEnv('VITE_AUTH_STRATEGY', 'mock');

    const strategy = createAuthStrategy();

    expect(strategy).toBeInstanceOf(MockAuthStrategy);
  });
});
