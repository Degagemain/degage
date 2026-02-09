import { cookies, headers } from 'next/headers';
import { auth } from '@/auth';
import { dbUserUpdateLocale } from '@/storage/user/user.update';
import { type UILocale, uiLocales } from '@/i18n/locales';

export async function PATCH(request: Request) {
  const { locale } = await request.json();

  if (!uiLocales.includes(locale as UILocale)) {
    return Response.json({ error: 'Invalid locale' }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.id) {
    await dbUserUpdateLocale(session.user.id, locale);
  }

  return Response.json({ success: true });
}
