import { NextRequest, NextResponse } from 'next/server';
import { type UILocale, defaultUILocale, uiLocales } from './app/i18n/locales';

const skipLocaleCookie = (pathname: string): boolean =>
  pathname.startsWith('/api') ||
  pathname.startsWith('/mcp') ||
  pathname.startsWith('/.well-known') ||
  pathname.startsWith('/_next') ||
  pathname.includes('.');

export function proxy(request: NextRequest) {
  if (skipLocaleCookie(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const localeCookie = request.cookies.get('locale')?.value;

  if (localeCookie && uiLocales.includes(localeCookie as UILocale)) {
    return NextResponse.next();
  }

  // No cookie: set app default so new sessions get the default locale (e.g. nl), not Accept-Language
  const response = NextResponse.next();
  response.cookies.set('locale', defaultUILocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
