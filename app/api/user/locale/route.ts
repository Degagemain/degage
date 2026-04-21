import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { dbUserUpdateLocale } from '@/storage/user/user.update';
import { type UILocale, uiLocales } from '@/i18n/locales';
import { safeParseRequestJson } from '@/api/utils';
import { withPublic } from '@/api/with-context';

export const PATCH = withPublic(async (request: NextRequest, _context, session) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  const { locale } = data as { locale: string };

  if (!uiLocales.includes(locale as UILocale)) {
    return Response.json({ error: 'Invalid locale' }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  if (session?.user?.id) {
    await dbUserUpdateLocale(session.user.id, locale);
  }

  return Response.json({ success: true });
});
