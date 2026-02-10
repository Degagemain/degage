import * as cheerio from 'cheerio';

const TABLE_SELECTOR = 'table#dataTables-infosessions';

export interface InfosessionRow {
  tijdstip: string;
  wijk: string;
  type: string;
  inschrijvingen: string;
  gastvrouwGastheer: string;
  enrollId: string | null;
  enrollUrl: string | null;
}

export function parseInfosessionTable(html: string): InfosessionRow[] {
  const $ = cheerio.load(html);
  const table = $(TABLE_SELECTOR);
  if (!table.length) {
    return [];
  }

  const rows: InfosessionRow[] = [];
  table.find('tbody tr').each((_, tr) => {
    const cells = $(tr).find('td');
    if (cells.length < 6) return;

    const tijdstip = $(cells[0]).text().trim();
    const wijk = $(cells[1]).text().trim();
    const type = $(cells[2])
      .text()
      .replace(/\u00a0/g, ' ')
      .trim();
    const inschrijvingen = $(cells[3]).text().trim();
    const gastvrouwGastheer = $(cells[4]).text().trim();

    const actionCell = $(cells[5]);
    const enrollLink = actionCell.find('a[href*="/infosession/enroll"]').attr('href');
    let enrollId: string | null = null;
    let enrollUrl: string | null = null;
    if (enrollLink) {
      enrollUrl = enrollLink.startsWith('http') ? enrollLink : `https://degapp.be${enrollLink}`;
      const match = enrollLink.match(/[?&]id=(\d+)/);
      enrollId = match ? match[1] : null;
    }

    rows.push({
      tijdstip,
      wijk,
      type,
      inschrijvingen,
      gastvrouwGastheer,
      enrollId,
      enrollUrl,
    });
  });

  return rows;
}
