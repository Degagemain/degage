import { logger } from '@/lib/logger';
import { getPlayConnectorBaseUrl } from '@/play-connector/config';
import { PlayConnectorError } from '@/play-connector/errors';

export type PlayFetchResult = {
  html: string;
  status: number;
};

export const fetchPlay = async (path: string, cookieHeader: string): Promise<PlayFetchResult> => {
  const baseUrl = getPlayConnectorBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Cookie: cookieHeader },
  });

  const html = await response.text();

  if (!response.ok) {
    logger.error('[play-connector] fetch failed', { code: 'fetch_failed', path, status: response.status });
    throw new PlayConnectorError('fetch_failed', `Play fetch failed with status ${response.status}`);
  }

  return { html, status: response.status };
};
