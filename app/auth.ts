import { betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { getPrismaClient } from './storage/utils';
import { dbUserGetLocale } from './storage/user/user.read';
import { sendEmail } from './integrations/resend';

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
      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, _request) => {
      await sendEmail({
        to: user.email,
        subject: 'Verify your email address',
        text: `Click the link to verify your email: ${url}`,
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
  },
  plugins: [admin()],
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
