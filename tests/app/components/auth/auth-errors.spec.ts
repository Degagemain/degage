import { describe, expect, it } from 'vitest';

import { getAuthErrorCode, getAuthErrorMessage } from '@/app/components/auth/lib/auth-errors';

const t = (key: string) =>
  (
    ({
      invalidEmailOrPassword: 'Invalid email or password',
      userAlreadyExists: 'User already exists',
      requestFailed: 'Request failed',
    }) as Record<string, string>
  )[key] ?? key;

describe('getAuthErrorMessage', () => {
  it('maps INVALID_EMAIL_OR_PASSWORD code to translation', () => {
    expect(getAuthErrorMessage({ error: { code: 'INVALID_EMAIL_OR_PASSWORD' } }, t)).toBe('Invalid email or password');
  });

  it('falls back to requestFailed when unknown', () => {
    expect(getAuthErrorMessage({}, t)).toBe('Request failed');
  });
});

describe('getAuthErrorCode', () => {
  it('returns Better Auth error code when present', () => {
    expect(getAuthErrorCode({ error: { code: 'INVALID_EMAIL_OR_PASSWORD' } })).toBe('INVALID_EMAIL_OR_PASSWORD');
  });

  it('returns unknown when no error details', () => {
    expect(getAuthErrorCode({})).toBe('unknown');
  });
});
