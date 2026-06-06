import { describe, expect, it } from 'vitest';
import { canUseMcpTools, mcpToolGateErrorMessage, parseScopes } from '@/mcp/auth-context';
import { Role } from '@/domain/role.model';

const baseContext = {
  userId: 'user-1',
  role: Role.USER,
  emailVerified: true,
  banned: false,
  scopes: ['mcp:user', 'openid'],
  clientId: 'client-1',
};

describe('mcp auth context', () => {
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
});
