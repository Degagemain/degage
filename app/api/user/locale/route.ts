import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { updateUserLocale } from '@/actions/user/update-locale';
import { userLocaleUpdateSchema } from '@/domain/user.model';
import { badRequestResponseFromZod, safeParseRequestJson } from '@/api/utils';
import { withPublic } from '@/api/with-context';

export const PATCH = withPublic(async (request: NextRequest, _context, session) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  const parsed = userLocaleUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return badRequestResponseFromZod(parsed);
  }

  const { locale } = parsed.data;

  const cookieStore = await cookies();
  cookieStore.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  if (session?.user?.id) {
    await updateUserLocale(session.user.id, locale);
  }

  return Response.json({ success: true });
});
