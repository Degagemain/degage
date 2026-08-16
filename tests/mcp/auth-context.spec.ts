import { afterEach, describe, expect, it, vi } from 'vitest';
import { APIError } from 'better-auth/api';
import { Role } from '@/domain/role.model';

vi.mock('@/storage/user/user.read-auth', () => ({
  dbUserReadAuthContext: vi.fn(),
}));

import { dbUserReadAuthContext } from '@/storage/user/user.read-auth';
import { assertUserCanReceiveOAuthToken, canUseMcpTools, loadMcpAuthContext, mcpToolGateErrorMessage, parseScopes } from '@/mcp/auth-context';

const baseContext = {
  userId: 'user-1',
  role: Role.USER,
  emailVerified: true,
  banned: false,
  scopes: ['mcp:user', 'openid'],
  clientId: 'client-1',
};

describe('mcp auth context', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('parseScopes handles string and array', () => {
    expect(parseScopes('mcp:user openid')).toEqual(['mcp:user', 'openid']);
    expect(parseScopes(['mcp:admin'])).toEqual(['mcp:admin']);
  });

  it('allows verified user with scope', () => {
    expect(canUseMcpTools(baseContext, 'mcp:user')).toEqual({ ok: true });
  });

  it('blocks banned users', () => {
    const result = canUseMcpTools({ ...baseContext, banned: true }, 'mcp:user');
    expect(result).toEqual({ ok: false, reason: 'banned' });
    expect(mcpToolGateErrorMessage('banned')).toContain('banned');
  });

  it('blocks unverified users', () => {
    const result = canUseMcpTools({ ...baseContext, emailVerified: false }, 'mcp:user');
    expect(result).toEqual({ ok: false, reason: 'unverified' });
  });

  it('blocks missing scope', () => {
    const result = canUseMcpTools({ ...baseContext, scopes: ['openid'] }, 'mcp:user');
    expect(result).toEqual({ ok: false, reason: 'forbidden_scope' });
  });

  it('requires admin role when requested', () => {
    const result = canUseMcpTools({ ...baseContext, scopes: ['mcp:admin'] }, 'mcp:admin', true);
    expect(result).toEqual({ ok: false, reason: 'forbidden_role' });
  });

  it('assertUserCanReceiveOAuthToken rejects banned users', async () => {
    vi.mocked(dbUserReadAuthContext).mockResolvedValueOnce({
      id: 'user-1',
      role: Role.USER,
      emailVerified: true,
      banned: true,
    });

    await expect(assertUserCanReceiveOAuthToken('user-1')).rejects.toBeInstanceOf(APIError);
    expect(dbUserReadAuthContext).toHaveBeenCalledWith('user-1');
  });

  it('assertUserCanReceiveOAuthToken allows non-banned users', async () => {
    vi.mocked(dbUserReadAuthContext).mockResolvedValueOnce({
      id: 'user-1',
      role: Role.USER,
      emailVerified: true,
      banned: false,
    });

    await expect(assertUserCanReceiveOAuthToken('user-1')).resolves.toBeUndefined();
  });

  it('loadMcpAuthContext maps storage auth fields', async () => {
    vi.mocked(dbUserReadAuthContext).mockResolvedValueOnce({
      id: 'user-1',
      role: Role.ADMIN,
      emailVerified: true,
      banned: false,
    });

    await expect(loadMcpAuthContext({ userId: 'user-1', scopes: 'mcp:admin openid', clientId: 'client-1' })).resolves.toEqual({
      userId: 'user-1',
      role: Role.ADMIN,
      emailVerified: true,
      banned: false,
      scopes: ['mcp:admin', 'openid'],
      clientId: 'client-1',
    });
  });

  it('loadMcpAuthContext returns null when the user is missing', async () => {
    vi.mocked(dbUserReadAuthContext).mockResolvedValueOnce(null);

    await expect(loadMcpAuthContext({ userId: 'missing', scopes: [] })).resolves.toBeNull();
  });
});
