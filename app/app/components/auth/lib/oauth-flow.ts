'use client';

import { filterGrantableScopes, grantableMcpScopesForRole, mcpOidcScopes } from '@/mcp/config';

const parseSignedQuery = (search: string): string | undefined => {
  const params = new URLSearchParams(search);
  if (!params.has('sig')) return undefined;

  const signedParams = new URLSearchParams();
  for (const [key, value] of params.entries()) {
    signedParams.append(key, value);
    if (key === 'sig') break;
  }
  return signedParams.toString();
};

const oauthPost = async <T>(path: string, body: Record<string, unknown>): Promise<T> => {
  const oauthQuery = typeof window !== 'undefined' ? parseSignedQuery(window.location.search) : undefined;
  const response = await fetch(`/api/auth${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...body,
      ...(oauthQuery ? { oauth_query: oauthQuery } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`OAuth request failed (${response.status})`);
  }

  return (await response.json()) as T;
};

export const hasOAuthQueryInUrl = (): boolean => {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('sig');
};

export const filterConsentScopes = (scopeParam: string | null, role: string | null | undefined): string => {
  const requested = scopeParam?.split(/\s+/).filter(Boolean) ?? [];
  const oidc = [...mcpOidcScopes];
  const mcpScopes = filterGrantableScopes(requested, role);
  const merged = [...new Set([...oidc, ...mcpScopes.filter((scope) => requested.includes(scope))])];
  const grantableMcp = grantableMcpScopesForRole(role);
  for (const scope of requested) {
    if (scope.startsWith('mcp:') && grantableMcp.includes(scope) && !merged.includes(scope)) {
      merged.push(scope);
    }
  }
  return merged.join(' ');
};

type OAuthRedirectResponse = {
  redirect: boolean;
  url: string;
};

export const submitOAuthConsent = async (accept: boolean, scope: string): Promise<OAuthRedirectResponse> => {
  return oauthPost<OAuthRedirectResponse>('/oauth2/consent', { accept, scope });
};

export const continueOAuthFlow = async (options?: { created?: boolean; selected?: boolean }): Promise<OAuthRedirectResponse> => {
  return oauthPost<OAuthRedirectResponse>('/oauth2/continue', {
    created: options?.created ?? false,
    selected: options?.selected ?? false,
  });
};

export const redirectToOAuthUrl = (url: string): void => {
  window.location.href = url;
};
