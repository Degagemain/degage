import * as cheerio from 'cheerio';

export const parseCarsPageNames = (html: string): string[] => {
  const $ = cheerio.load(html);
  const names: string[] = [];

  $('a[href^="/cars/view"]').each((_, el) => {
    const name = $(el).text().replace(/\s+/g, ' ').trim();
    if (name) {
      names.push(name);
    }
  });

  return names;
};
