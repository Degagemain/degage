import { logger } from '@/lib/logger';
import { getPlayConnectorBaseUrl } from '@/play-connector/config';
import { mergeSetCookiesIntoHeader } from '@/play-connector/cookie';
import { PlayConnectorError } from '@/play-connector/errors';

export const enablePlayAdminMode = async (cookieHeader: string): Promise<string> => {
  const baseUrl = getPlayConnectorBaseUrl();
  const response = await fetch(`${baseUrl}/admin/set`, {
    method: 'GET',
    headers: { Cookie: cookieHeader },
    redirect: 'manual',
  });

  const setCookieHeaders = response.headers.getSetCookie?.() ?? [];
  const hasPlaySession = setCookieHeaders.some((header) => header.toLowerCase().startsWith('play_session='));
  const isRedirect = response.status >= 300 && response.status < 400;

  if (!isRedirect || !hasPlaySession) {
    logger.error('[play-connector] admin mode enable failed', {
      code: 'fetch_failed',
      status: response.status,
      hasPlaySession,
    });
    throw new PlayConnectorError('fetch_failed', 'Play admin mode enable failed');
  }

  return mergeSetCookiesIntoHeader(cookieHeader, setCookieHeaders);
};
