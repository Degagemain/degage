import { NextRequest, NextResponse } from 'next/server';
import { type UILocale, defaultUILocale, uiLocales } from './app/i18n/locales';

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.includes('.')) {
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
