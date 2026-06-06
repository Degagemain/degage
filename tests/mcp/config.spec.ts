import { afterEach, describe, expect, it } from 'vitest';
import {
  betterAuthIssuer,
  filterGrantableScopes,
  grantableMcpScopesForRole,
  isMcpEnabled,
  mcpAudience,
  mcpPath,
  mcpRoleScope,
  mcpRoleScopes,
  oauthProviderScopes,
} from '@/mcp/config';

describe('mcp config', () => {
  const originalMcpEnabled = process.env.MCP_ENABLED;
  const originalAuthUrl = process.env.BETTER_AUTH_URL;

  afterEach(() => {
    process.env.MCP_ENABLED = originalMcpEnabled;
    process.env.BETTER_AUTH_URL = originalAuthUrl;
  });

  it('isMcpEnabled is false by default', () => {
    delete process.env.MCP_ENABLED;
    expect(isMcpEnabled()).toBe(false);
  });

  it('isMcpEnabled is true when env is true', () => {
    process.env.MCP_ENABLED = 'true';
    expect(isMcpEnabled()).toBe(true);
  });

  it('derives audience and issuer from BETTER_AUTH_URL', () => {
    process.env.BETTER_AUTH_URL = 'http://localhost:3000/';
    expect(mcpPath).toBe('/mcp');
    expect(mcpAudience()).toBe('http://localhost:3000/mcp');
    expect(betterAuthIssuer()).toBe('http://localhost:3000/api/auth');
  });

  it('defines role-based scopes', () => {
    expect(mcpRoleScopes).toEqual(['mcp:admin', 'mcp:user']);
    expect(oauthProviderScopes).toContain('openid');
    expect(oauthProviderScopes).toContain(mcpRoleScope('user'));
  });

  it('filters grantable scopes by role', () => {
    expect(grantableMcpScopesForRole('admin')).toEqual(['mcp:user', 'mcp:admin']);
    expect(grantableMcpScopesForRole('user')).toEqual(['mcp:user']);
    expect(filterGrantableScopes(['openid', 'mcp:user', 'mcp:admin'], 'user')).toEqual(['openid', 'mcp:user']);
  });
});
