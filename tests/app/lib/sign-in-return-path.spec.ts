import { describe, expect, it } from 'vitest';

import {
  SIGN_IN_REDIRECT_QUERY_PARAM,
  buildPostSignInReturnPath,
  buildSignInUrlWithReturnPath,
  sanitizePostSignInReturnPath,
} from '@/app/lib/sign-in-return-path';

describe('sanitizePostSignInReturnPath', () => {
  it('allows /app paths', () => {
    expect(sanitizePostSignInReturnPath('/app/admin/users')).toBe('/app/admin/users');
  });

  it('rejects protocol-relative URLs', () => {
    expect(sanitizePostSignInReturnPath('//evil.com')).toBe('/app');
  });

  it('rejects paths outside /app', () => {
    expect(sanitizePostSignInReturnPath('/other')).toBe('/app');
  });
});

describe('buildPostSignInReturnPath', () => {
  it('includes query string when present', () => {
    expect(buildPostSignInReturnPath('/app/admin/users', 'tab=1')).toBe('/app/admin/users?tab=1');
  });

  it('sanitizes the combined path', () => {
    expect(buildPostSignInReturnPath('/evil', '')).toBe('/app');
  });
});

describe('buildSignInUrlWithReturnPath', () => {
  it('embeds redirect param for better-auth-ui', () => {
    const url = buildSignInUrlWithReturnPath('/app/admin/users');
    expect(url).toContain(`/app/auth/sign-in?${SIGN_IN_REDIRECT_QUERY_PARAM}=`);
    expect(url).toContain(encodeURIComponent('/app/admin/users'));
  });
});
