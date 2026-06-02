import { describe, expect, it } from 'vitest';

import { getAuthErrorMessage } from '@/app/components/auth/lib/auth-errors';

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
