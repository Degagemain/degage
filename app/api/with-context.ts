import { NextRequest } from 'next/server';
import { cookies, headers } from 'next/headers';
import { auth } from '@/auth';
import { withRequestContext } from '@/context/request-context';
import { flushPostHogOtelLogs } from '@/lib/posthog-otel-logs';
import { type UILocale, defaultUILocale, getContentLocale, uiLocales } from '@/i18n/locales';
import { forbiddenResponse, unauthorizedResponse } from '@/api/utils';
import { isAdmin } from '@/domain/role.utils';

type RouteContext = { params: Promise<Record<string, string>> } | undefined;

export type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export type PublicRouteHandler = (request: NextRequest, context: RouteContext, session: Session | null) => Promise<Response>;

export type AuthedRouteHandler = (request: NextRequest, context: RouteContext, session: Session) => Promise<Response>;

type NextRouteHandler = (request: NextRequest, context?: RouteContext) => Promise<Response>;

const runWithContext = async (
  request: NextRequest,
  context: RouteContext,
  step: (session: Session | null) => Promise<Response>,
): Promise<Response> => {
  const session = await auth.api.getSession({ headers: await headers() });

  // Keep locale in sync with cookie (mirrors authenticated user's preference).
  let locale = defaultUILocale;
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value;
  if (cookieLocale && uiLocales.includes(cookieLocale as UILocale)) {
    locale = cookieLocale as UILocale;
  }

  return withRequestContext(
    {
      locale,
      contentLocale: getContentLocale(locale),
      userId: session?.user?.id,
    },
    async () => {
      try {
        return await step(session);
      } finally {
        await flushPostHogOtelLogs();
      }
    },
  );
};

/**
 * Wrap a route handler that must be reachable without authentication
 * (public wizards, signed webhooks, etc.). The session is still fetched
 * and forwarded (nullable) so handlers can opportunistically personalise.
 */
export const withPublic = (handler: PublicRouteHandler): NextRouteHandler => {
  return (request, context) => runWithContext(request, context, (session) => handler(request, context, session));
};

/**
 * Wrap a route handler that requires any authenticated user.
 * Returns 401 automatically when no session is present.
 */
export const withAuth = (handler: AuthedRouteHandler): NextRouteHandler => {
  return (request, context) =>
    runWithContext(request, context, (session) => {
      if (!session?.user) return Promise.resolve(unauthorizedResponse());
      return handler(request, context, session);
    });
};

/**
 * Wrap a route handler that requires an admin user.
 * Returns 401 if no session, 403 if the user is not an admin.
 */
export const withAdmin = (handler: AuthedRouteHandler): NextRouteHandler => {
  return (request, context) =>
    runWithContext(request, context, (session) => {
      if (!session?.user) return Promise.resolve(unauthorizedResponse());
      if (!isAdmin(session.user)) return Promise.resolve(forbiddenResponse());
      return handler(request, context, session);
    });
};
