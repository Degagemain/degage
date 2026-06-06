import { betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, jwt } from 'better-auth/plugins';
import { oauthProvider } from '@better-auth/oauth-provider';
import { isMcpEnabled, oauthProviderScopes } from '@/mcp/config';
import { assertUserCanReceiveOAuthToken } from '@/mcp/auth-context';
import { getPrismaClient } from './storage/utils';
import { dbUserGetLocale } from './storage/user/user.read';
import { TemplatesEnum, sendTemplatedEmail } from './integrations/resend';

const prisma = getPrismaClient();

function isAdminDomain(email: string | null | undefined): boolean {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return !!domain && (process.env.ADMIN_EMAIL_DOMAINS?.split(',') ?? []).includes(domain);
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }, _request) => {
      const locale = await dbUserGetLocale(user.id);
      await sendTemplatedEmail({
        to: user.email,
        template: TemplatesEnum.ResetPasswordEmail,
        locale,
        variables: { PASSWORD_RESET_URL: url },
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, _request) => {
      const locale = await dbUserGetLocale(user.id);
      await sendTemplatedEmail({
        to: user.email,
        template: TemplatesEnum.VerificationEmail,
        locale,
        variables: { VERIFICATION_URL: url },
      });
    },
  },
  socialProviders: {
    github:
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
        ? {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }
        : undefined,
    google:
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }
        : undefined,
  },
  plugins: [
    admin(),
    ...(isMcpEnabled()
      ? [
          jwt(),
          oauthProvider({
            loginPage: '/app/auth/sign-in',
            consentPage: '/app/auth/consent',
            signup: { page: '/app/auth/sign-up' },
            scopes: oauthProviderScopes,
            validAudiences: [`${process.env.BETTER_AUTH_URL}/mcp`],
            allowUnauthenticatedClientRegistration: true,
            allowDynamicClientRegistration: true,
            silenceWarnings: {
              oauthAuthServerConfig: true,
              openidConfig: true,
            },
            customAccessTokenClaims: ({ user }) => ({
              role: user?.role ?? 'user',
              email_verified: user?.emailVerified ?? false,
            }),
          }),
        ]
      : []),
  ],
  databaseHooks: {
    user: {
      update: {
        after: async (user) => {
          if (!user.emailVerified || user.role === 'admin') return;
          if (!isAdminDomain(user.email)) return;
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'admin' },
          });
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (!isMcpEnabled()) return;
      if (!ctx.path.startsWith('/oauth2/token')) return;
      const session = ctx.context.session;
      if (session?.user?.id) {
        await assertUserCanReceiveOAuthToken(session.user.id);
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      // Set locale cookie after successful sign-in, sign-up, or OAuth callback
      if (ctx.path.startsWith('/sign-in') || ctx.path.startsWith('/sign-up') || ctx.path.startsWith('/callback')) {
        const newSession = ctx.context.newSession;
        if (newSession?.user?.id) {
          const locale = await dbUserGetLocale(newSession.user.id);
          if (locale) {
            ctx.setCookie('locale', locale, {
              path: '/',
              maxAge: 60 * 60 * 24 * 365,
              sameSite: 'lax',
            });
          }
        }
      }
    }),
  },
});
