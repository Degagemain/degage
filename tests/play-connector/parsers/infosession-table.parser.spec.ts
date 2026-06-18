import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { parseInfosessionTable } from '@/play-connector/parsers/infosession-table.parser';

const fixturePath = join(process.cwd(), 'tests/fixtures/play-connector/infosession-table.html');

describe('parseInfosessionTable', () => {
  it('parses rows from the real infosession fixture', () => {
    const html = readFileSync(fixturePath, 'utf8');
    const rows = parseInfosessionTable(html);

    expect(rows).toHaveLength(21);
    expect(rows[0]).toMatchObject({
      scheduledAt: 'za 20 jun 2026 09:25',
      district: 'Gent - Wondelgem',
      type: 'Voor Leners van auto of fiets',
      registrations: '14 / 20',
      host: 'Host Alpha',
      enrollId: '1359',
      enrollUrl: 'https://degapp.be/infosession/enroll?id=1359',
    });
  });

  it('returns an empty array when the table is missing', () => {
    expect(parseInfosessionTable('<html><body></body></html>')).toEqual([]);
  });
});
