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

  const acceptLanguage = request.headers.get('accept-language');
  let detectedLocale: UILocale = defaultUILocale;

  if (acceptLanguage) {
    const preferredLocales = acceptLanguage.split(',').map((lang) => lang.split(';')[0].trim());

    for (const preferred of preferredLocales) {
      const base = preferred.split('-')[0];
      if (uiLocales.includes(base as UILocale)) {
        detectedLocale = base as UILocale;
        break;
      }
    }
  }

  const response = NextResponse.next();
  response.cookies.set('locale', detectedLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
