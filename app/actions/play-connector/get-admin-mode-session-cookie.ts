import * as cheerio from 'cheerio';

import { type PlaySessionCookieResult, getPlaySessionCookie } from '@/actions/play-connector/get-session-cookie';
import { PlayConnectorActionError, playConnectorActionErrorCodes } from '@/domain/play-connector.errors';
import { logger } from '@/lib/logger';
import { enablePlayAdminMode } from '@/play-connector/admin-mode';
import { fetchPlay } from '@/play-connector/client';
import { PlayConnectorError } from '@/play-connector/errors';

const hasAdminModeClearLink = (html: string): boolean => cheerio.load(html)('a[href="/admin/clear"]').length > 0;

export const getPlayAdminModeSessionCookie = async (userId: string): Promise<PlaySessionCookieResult> => {
  const { cookieHeader } = await getPlaySessionCookie(userId);

  let upgradedCookieHeader: string;
  try {
    upgradedCookieHeader = await enablePlayAdminMode(cookieHeader);
  } catch (error) {
    logger.error('[play-connector] admin mode unauthorized', {
      code: playConnectorActionErrorCodes.unauthorized,
      userId,
      cause: error instanceof PlayConnectorError ? error.code : 'unknown',
    });
    throw new PlayConnectorActionError(playConnectorActionErrorCodes.unauthorized, 'Play user cannot enter admin mode');
  }

  const { html } = await fetchPlay('/', upgradedCookieHeader);
  if (!hasAdminModeClearLink(html)) {
    logger.error('[play-connector] admin mode unauthorized', {
      code: playConnectorActionErrorCodes.unauthorized,
      userId,
      cause: 'missing_admin_clear',
    });
    throw new PlayConnectorActionError(playConnectorActionErrorCodes.unauthorized, 'Play user cannot enter admin mode');
  }

  return { cookieHeader: upgradedCookieHeader };
};
