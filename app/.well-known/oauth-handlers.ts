import { oauthProviderAuthServerMetadata, oauthProviderOpenIdConfigMetadata } from '@better-auth/oauth-provider';
import { auth } from '@/auth';
import { isMcpEnabled } from '@/mcp/config';

const authServerMetadataHandler = oauthProviderAuthServerMetadata(auth);
const openIdConfigMetadataHandler = oauthProviderOpenIdConfigMetadata(auth);

const withMcpEnabled = (handler: (request: Request) => Promise<Response>) => {
  return async (request: Request): Promise<Response> => {
    if (!isMcpEnabled()) {
      return new Response(null, { status: 404 });
    }
    return handler(request);
  };
};

export const GET_OAUTH_AUTHORIZATION_SERVER = withMcpEnabled(authServerMetadataHandler);
export const GET_OPENID_CONFIGURATION = withMcpEnabled(openIdConfigMetadataHandler);
