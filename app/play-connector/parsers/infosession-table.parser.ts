import * as cheerio from 'cheerio';

import { getPlayConnectorBaseUrl } from '@/play-connector/config';

const TABLE_SELECTOR = 'table#dataTables-infosessions';

export type InfosessionTableRow = {
  scheduledAt: string;
  district: string;
  type: string;
  registrations: string;
  host: string;
  enrollId: string | null;
  enrollUrl: string | null;
};

export const parseInfosessionTable = (html: string): InfosessionTableRow[] => {
  const $ = cheerio.load(html);
  const table = $(TABLE_SELECTOR);
  if (!table.length) {
    return [];
  }

  const baseUrl = getPlayConnectorBaseUrl();
  const rows: InfosessionTableRow[] = [];

  table.find('tbody tr').each((_, tr) => {
    const cells = $(tr).find('td');
    if (cells.length < 6) return;

    const scheduledAt = $(cells[0]).text().replace(/\s+/g, ' ').trim();
    const district = $(cells[1]).text().trim();
    const type = $(cells[2])
      .text()
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const registrations = $(cells[3]).text().trim();
    const host = $(cells[4]).text().trim();

    const enrollLink = $(cells[5]).find('a[href*="/infosession/enroll"]').attr('href');
    let enrollId: string | null = null;
    let enrollUrl: string | null = null;

    if (enrollLink) {
      enrollUrl = enrollLink.startsWith('http') ? enrollLink : `${baseUrl}${enrollLink}`;
      const match = enrollLink.match(/[?&]id=(\d+)/);
      enrollId = match ? match[1] : null;
    }

    rows.push({
      scheduledAt,
      district,
      type,
      registrations,
      host,
      enrollId,
      enrollUrl,
    });
  });

  return rows;
};
