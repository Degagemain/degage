/***
 * Client-side Better Auth client for session hooks and sign-in/sign-up flows.
 */
import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';
import { oauthProviderClient } from '@better-auth/oauth-provider/client';

export const authClient = createAuthClient({
  plugins: [adminClient(), oauthProviderClient()],
});
