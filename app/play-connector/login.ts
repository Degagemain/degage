import { logger } from '@/lib/logger';
import { getPlayConnectorBaseUrl } from '@/play-connector/config';
import { buildCookieHeader, computeSessionExpiry, parseSetCookieHeaders } from '@/play-connector/cookie';
import { PlayConnectorError } from '@/play-connector/errors';

export type PlayLoginResult = {
  cookieHeader: string;
  expiresAt: Date | null;
};

export const loginToPlay = async (email: string, password: string): Promise<PlayLoginResult> => {
  const baseUrl = getPlayConnectorBaseUrl();
  const formBody = new URLSearchParams({ email, password }).toString();

  const response = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody,
    redirect: 'manual',
  });

  const setCookieHeaders = response.headers.getSetCookie?.() ?? [];
  const parsedCookies = parseSetCookieHeaders(setCookieHeaders);

  if (parsedCookies.length === 0 || response.status >= 400) {
    logger.error('[play-connector] login failed', {
      code: 'login_failed',
      status: response.status,
      hasCookies: parsedCookies.length > 0,
    });
    throw new PlayConnectorError('login_failed', 'Play login failed');
  }

  return {
    cookieHeader: buildCookieHeader(parsedCookies),
    expiresAt: computeSessionExpiry(parsedCookies),
  };
};
