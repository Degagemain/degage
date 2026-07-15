import * as cheerio from 'cheerio';

import type { InfosessionTableRow } from '@/play-connector/parsers/infosession-table.parser';

const CHOSEN_PANEL_HEADING = 'Gekozen infosessie';

export const parseChosenInfosession = (html: string): InfosessionTableRow | null => {
  const $ = cheerio.load(html);
  const chosenPanel = $('.panel.panel-default')
    .filter((_, panel) => {
      const heading = $(panel).find('.panel-heading').text().replace(/\s+/g, ' ').trim();
      return heading.includes(CHOSEN_PANEL_HEADING);
    })
    .first();

  if (!chosenPanel.length) {
    return null;
  }

  const dl = chosenPanel.find('dl.dl-horizontal').first();
  if (!dl.length) {
    return null;
  }

  const fields: Record<string, string> = {};
  dl.find('dt').each((_, dt) => {
    const label = $(dt).text().replace(/\s+/g, ' ').trim();
    const value = $(dt).next('dd').text().replace(/\s+/g, ' ').trim();
    fields[label] = value;
  });

  const scheduledAt = fields['Wanneer?'];
  if (!scheduledAt) {
    return null;
  }

  return {
    scheduledAt,
    district: fields['Waar?'] ?? '',
    type: fields['Type'] ?? '',
    registrations: fields['Aantal deeln.'] ?? '0',
    host: fields['Gastvrouw / gastheer'] ?? '',
    enrollId: null,
    enrollUrl: null,
  };
};
