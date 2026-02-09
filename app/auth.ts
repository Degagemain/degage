import { betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { getPrismaClient } from './storage/utils';
import { dbUserGetLocale } from './storage/user/user.read';

const prisma = getPrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async (data, ctx) => {
      console.log('to do: send reset password email', data, ctx);
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [admin()],
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
