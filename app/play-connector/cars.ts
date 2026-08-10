import { getPlayAdminModeSessionCookie } from '@/actions/play-connector/get-admin-mode-session-cookie';
import { fetchPlay } from '@/play-connector/client';
import { PlayConnectorError } from '@/play-connector/errors';
import { parseCarsPageTotal } from '@/play-connector/parsers/cars-page.parser';

const buildCarsNameFilter = (name: string): string => `name=${name},brand=,license_plate=,owner=,zipCode=,city=,district=`;

export const playConnectorIsCarNameAvailable = async (adminModeUserId: string, name: string): Promise<boolean> => {
  if (name.includes(',') || name.includes('=')) {
    throw new PlayConnectorError('fetch_failed', 'Car name must not contain comma or equals');
  }

  const { cookieHeader } = await getPlayAdminModeSessionCookie(adminModeUserId);
  const filter = encodeURIComponent(buildCarsNameFilter(name));
  const path = `/cars/page?page=1&pageSize=50&asc=1&orderBy=&filter=${filter}`;
  const { html } = await fetchPlay(path, cookieHeader);
  const total = parseCarsPageTotal(html);

  if (total === null) {
    throw new PlayConnectorError('fetch_failed', 'Play cars page pagination missing');
  }

  return total === 0;
};
