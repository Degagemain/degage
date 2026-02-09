import { NextRequest } from 'next/server';
import { cookies, headers } from 'next/headers';
import { auth } from '@/auth';
import { withRequestContext } from '@/context/request-context';
import { type UILocale, defaultUILocale, getContentLocale, uiLocales } from '@/i18n/locales';

type RouteHandler = (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => Promise<Response>;

export function withContext(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    const session = await auth.api.getSession({ headers: await headers() });

    // Get locale from cookie (always kept in sync with user preference)
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
      () => handler(request, context),
    );
  };
}
