export const SESSION_COOKIE_NAME = 'central_pet_session';

export type SessionCookieMode = 'jwt' | 'mock';

export type ParsedSessionCookie = {
  mode: SessionCookieMode;
  value: string;
};

export function isMockAuthEnabled(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export function buildSessionCookieValue(mode: SessionCookieMode, value: string): string {
  return `${mode}:${value}`;
}

export function parseSessionCookieValue(raw?: string | null): ParsedSessionCookie | null {
  if (!raw) {
    return null;
  }

  const separatorIndex = raw.indexOf(':');

  if (separatorIndex < 0) {
    return {
      mode: 'jwt',
      value: raw,
    };
  }

  const mode = raw.slice(0, separatorIndex);
  const value = raw.slice(separatorIndex + 1);

  if ((mode !== 'jwt' && mode !== 'mock') || !value) {
    return null;
  }

  return {
    mode,
    value,
  };
}
