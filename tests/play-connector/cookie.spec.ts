import { describe, expect, it } from 'vitest';

import { buildCookieHeader, computeSessionExpiry, parseSetCookieHeader, parseSetCookieHeaders } from '@/play-connector/cookie';

describe('play-connector cookie', () => {
  it('parses a Set-Cookie header', () => {
    const parsed = parseSetCookieHeader('PLAY_SESSION=abc123; Path=/; HttpOnly; Secure; Max-Age=3600; SameSite=Lax');
    expect(parsed).toMatchObject({
      name: 'PLAY_SESSION',
      value: 'abc123',
      path: '/',
      httpOnly: true,
      secure: true,
      maxAge: 3600,
      sameSite: 'Lax',
    });
  });

  it('builds a cookie header from parsed cookies', () => {
    const cookies = parseSetCookieHeaders(['PLAY_SESSION=a; Path=/', 'JSESSIONID=b; Path=/']);
    expect(buildCookieHeader(cookies)).toBe('PLAY_SESSION=a; JSESSIONID=b');
  });

  it('computes earliest session expiry from max-age', () => {
    const cookies = parseSetCookieHeaders(['PLAY_SESSION=a; Max-Age=7200', 'JSESSIONID=b; Max-Age=3600']);
    const expiry = computeSessionExpiry(cookies);
    expect(expiry).not.toBeNull();
    const deltaSeconds = Math.round((expiry!.getTime() - Date.now()) / 1000);
    expect(deltaSeconds).toBeGreaterThanOrEqual(3590);
    expect(deltaSeconds).toBeLessThanOrEqual(3600);
  });
});
