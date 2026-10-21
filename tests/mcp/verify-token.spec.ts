import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('better-auth/oauth2', () => ({
  verifyBearerToken: vi.fn(),
}));

vi.mock('@/mcp/auth-context', () => ({
  loadMcpAuthContext: vi.fn(),
  parseScopes: vi.fn((scopes: string | undefined) => (scopes ? scopes.split(/\s+/) : [])),
}));

import { verifyBearerToken } from 'better-auth/oauth2';
import { loadMcpAuthContext } from '@/mcp/auth-context';
import { verifyMcpAccessToken } from '@/mcp/verify-token';

describe('verifyMcpAccessToken', () => {
  const originalAuthUrl = process.env.BETTER_AUTH_URL;

  afterEach(() => {
    process.env.BETTER_AUTH_URL = originalAuthUrl;
    vi.clearAllMocks();
  });

  it('returns undefined when bearer token is missing', async () => {
    const result = await verifyMcpAccessToken(undefined, 'aud');
    expect(result).toBeUndefined();
    expect(verifyBearerToken).not.toHaveBeenCalled();
  });

  it('verifies token with issuer and jwks derived from BETTER_AUTH_URL', async () => {
    process.env.BETTER_AUTH_URL = 'http://localhost:3000';
    vi.mocked(verifyBearerToken).mockResolvedValueOnce({
      sub: 'user-1',
      scope: 'openid mcp:user',
      azp: 'client-1',
    });
    vi.mocked(loadMcpAuthContext).mockResolvedValueOnce({
      userId: 'user-1',
      role: 'user',
      emailVerified: true,
      banned: false,
      scopes: ['openid', 'mcp:user'],
      clientId: 'client-1',
    });

    const result = await verifyMcpAccessToken('test-token', 'http://localhost:3000/mcp');

    expect(verifyBearerToken).toHaveBeenCalledWith('test-token', {
      jwksUrl: 'http://localhost:3000/api/auth/jwks',
      verifyOptions: {
        audience: 'http://localhost:3000/mcp',
        issuer: 'http://localhost:3000/api/auth',
      },
    });
    expect(result?.token).toBe('test-token');
    expect(result?.clientId).toBe('client-1');
  });

  it('returns undefined when verification throws', async () => {
    process.env.BETTER_AUTH_URL = 'http://localhost:3000';
    vi.mocked(verifyBearerToken).mockRejectedValueOnce(new Error('invalid access token'));

    const result = await verifyMcpAccessToken('bad-token', 'http://localhost:3000/mcp');

    expect(result).toBeUndefined();
  });
});
