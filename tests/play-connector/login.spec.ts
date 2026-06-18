import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { loginToPlay } from '@/play-connector/login';

describe('loginToPlay', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns cookie header and expiry on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 302,
        headers: {
          getSetCookie: () => ['PLAY_SESSION=abc; Path=/; Max-Age=3600'],
        },
      }),
    );

    const result = await loginToPlay('user@example.com', 'password');
    expect(result.cookieHeader).toBe('PLAY_SESSION=abc');
    expect(result.expiresAt).not.toBeNull();
  });

  it('throws when login returns no cookies', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 401,
        headers: { getSetCookie: () => [] },
      }),
    );

    await expect(loginToPlay('user@example.com', 'wrong')).rejects.toMatchObject({ code: 'login_failed' });
  });
});
