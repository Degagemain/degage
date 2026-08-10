import { logger } from '@/lib/logger';
import { getPlayConnectorBaseUrl } from '@/play-connector/config';
import { PlayConnectorError } from '@/play-connector/errors';

export type PlayFetchResult = {
  html: string;
  status: number;
};

export type PlayPostJsonResult = {
  text: string;
  status: number;
};

const resolvePlayUrl = (path: string): string => {
  const baseUrl = getPlayConnectorBaseUrl();
  return path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

export const fetchPlay = async (path: string, cookieHeader: string): Promise<PlayFetchResult> => {
  const response = await fetch(resolvePlayUrl(path), {
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

export const postPlayJson = async (path: string, cookieHeader: string, body: unknown): Promise<PlayPostJsonResult> => {
  const response = await fetch(resolvePlayUrl(path), {
    method: 'POST',
    headers: {
      Cookie: cookieHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();

  if (!response.ok) {
    logger.error('[play-connector] post failed', { code: 'fetch_failed', path, status: response.status });
    throw new PlayConnectorError('fetch_failed', `Play post failed with status ${response.status}`);
  }

  return { text, status: response.status };
};
