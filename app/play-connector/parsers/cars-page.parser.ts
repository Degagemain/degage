import * as cheerio from 'cheerio';

export const parseCarsPageTotal = (html: string): number | null => {
  const $ = cheerio.load(html);
  const raw = $('#pagination').attr('name');
  if (!raw) {
    return null;
  }

  const [totalPart] = raw.split(',');
  const total = Number.parseInt(totalPart ?? '', 10);
  return Number.isFinite(total) ? total : null;
};
