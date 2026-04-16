import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAuthStrategy } from './factory';
import { SessionAuthStrategy } from '@/lib/auth';
import { MockAuthStrategy } from '@/lib/auth';

describe('createAuthStrategy', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('usa sessao auth por padrao', () => {
    const strategy = createAuthStrategy();

    expect(strategy).toBeInstanceOf(SessionAuthStrategy);
  });

  it('cria a estrategia de sessao quando solicitado', () => {
    vi.stubEnv('VITE_AUTH_STRATEGY', 'session');

    const strategy = createAuthStrategy();

    expect(strategy).toBeInstanceOf(SessionAuthStrategy);
  });

  it('cria a estrategia mock quando configurado explicitamente', () => {
    vi.stubEnv('VITE_AUTH_STRATEGY', 'mock');

    const strategy = createAuthStrategy();

    expect(strategy).toBeInstanceOf(MockAuthStrategy);
  });
});
