import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { verifyAccessToken } from 'better-auth/oauth2';
import { loadMcpAuthContext, parseScopes } from '@/mcp/auth-context';
import { betterAuthIssuer } from '@/mcp/config';

export const verifyMcpAccessToken = async (bearerToken: string | undefined, audience: string): Promise<AuthInfo | undefined> => {
  if (!bearerToken) return undefined;

  const issuer = betterAuthIssuer();

  try {
    const payload = await verifyAccessToken(bearerToken, {
      jwksUrl: `${issuer}/jwks`,
      verifyOptions: {
        audience,
        issuer,
      },
    });

    const userId = typeof payload.sub === 'string' ? payload.sub : undefined;
    if (!userId) return undefined;

    const clientId = typeof payload.client_id === 'string' ? payload.client_id : typeof payload.azp === 'string' ? payload.azp : undefined;

    const ctx = await loadMcpAuthContext({
      userId,
      scopes: parseScopes(typeof payload.scope === 'string' ? payload.scope : undefined),
      clientId,
    });

    if (!ctx) return undefined;

    return {
      token: bearerToken,
      scopes: ctx.scopes,
      clientId: ctx.clientId,
      extra: {
        mcpContext: ctx,
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('MCP access token verification failed:', error);
    }
    return undefined;
  }
};
