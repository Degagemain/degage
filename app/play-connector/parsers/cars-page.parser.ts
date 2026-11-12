import * as cheerio from 'cheerio';

export type PlayCarListRow = {
  id: number;
  name: string;
  brand: string;
  active: boolean;
};

const collapseText = (value: string): string => value.replace(/\s+/g, ' ').trim();

export const parseCarsPageRows = (html: string): PlayCarListRow[] => {
  const $ = cheerio.load(html);
  const headers = $('table#dataTables-cars thead th').toArray();
  const columnIndex = (name: string): number => headers.findIndex((header) => $(header).attr('name') === name);
  const brandIndex = columnIndex('brand');
  const activeIndex = columnIndex('active');
  const rows: PlayCarListRow[] = [];

  $('table#dataTables-cars tbody tr').each((_, tr) => {
    const link = $(tr).find('a[href^="/cars/view"]').first();
    const href = link.attr('href') ?? '';
    const idMatch = href.match(/[?&]id=(\d+)/);
    const name = collapseText(link.text());
    if (!idMatch || !name) return;

    const id = Number(idMatch[1]);
    if (!Number.isInteger(id) || id <= 0) return;

    const cells = $(tr).children('td').toArray();
    const cellText = (index: number): string => (index >= 0 && cells[index] ? collapseText($(cells[index]).text()) : '');

    rows.push({
      id,
      name,
      brand: cellText(brandIndex),
      active: cellText(activeIndex) === 'Actief',
    });
  });

  return rows;
};

export const parseCarsPageNames = (html: string): string[] => parseCarsPageRows(html).map((row) => row.name);
