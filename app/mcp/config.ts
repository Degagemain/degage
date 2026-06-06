import { roleValues } from '@/domain/role.model';

export const isMcpEnabled = (): boolean => process.env.MCP_ENABLED === 'true';

export const betterAuthBaseUrl = (): string => (process.env.BETTER_AUTH_URL ?? '').replace(/\/$/, '');

export const betterAuthIssuer = (): string => `${betterAuthBaseUrl()}/api/auth`;

export const mcpPath = '/mcp';

export const mcpAudience = (): string => `${betterAuthBaseUrl()}${mcpPath}`;

export const mcpResourceMetadataPath = '/.well-known/oauth-protected-resource/mcp';

export const mcpServerName = 'deg-mcp';

export const mcpRoleScope = (role: string): `mcp:${string}` => `mcp:${role}`;

export const mcpRoleScopes = roleValues.map(mcpRoleScope);

export const mcpOidcScopes = ['openid', 'profile', 'email', 'offline_access'] as const;

export const oauthProviderScopes = [...mcpOidcScopes, ...mcpRoleScopes];

export const grantableMcpScopesForRole = (role: string | null | undefined): string[] => {
  if (role === 'admin') {
    return [mcpRoleScope('user'), mcpRoleScope('admin')];
  }
  return [mcpRoleScope('user')];
};

export const filterGrantableScopes = (requestedScopes: string[], role: string | null | undefined): string[] => {
  const grantableMcp = new Set(grantableMcpScopesForRole(role));
  return requestedScopes.filter((scope) => !scope.startsWith('mcp:') || grantableMcp.has(scope));
};
