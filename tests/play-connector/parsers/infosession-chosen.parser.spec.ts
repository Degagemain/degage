import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { parseChosenInfosession } from '@/play-connector/parsers/infosession-chosen.parser';
import { parseInfosessionTable } from '@/play-connector/parsers/infosession-table.parser';

const enrolledFixturePath = join(process.cwd(), 'tests/fixtures/play-connector/infosession-enrolled.html');
const tableFixturePath = join(process.cwd(), 'tests/fixtures/play-connector/infosession-table.html');

describe('parseChosenInfosession', () => {
  it('parses the gekozen infosessie panel from the enrolled Play page', () => {
    const html = readFileSync(enrolledFixturePath, 'utf8');
    const chosen = parseChosenInfosession(html);

    expect(chosen).toMatchObject({
      scheduledAt: 'vr 31 dec 2027 23:55',
      district: 'Online',
      type: 'Auto-eigenaar',
      registrations: '1 / 5',
      host: 'Host Chosen',
      enrollId: null,
      enrollUrl: null,
    });
  });

  it('returns null when the gekozen infosessie panel is missing', () => {
    const html = readFileSync(tableFixturePath, 'utf8');
    expect(parseChosenInfosession(html)).toBeNull();
  });

  it('returns null for empty html', () => {
    expect(parseChosenInfosession('<html><body></body></html>')).toBeNull();
  });
});

describe('parseInfosessionTable with enrolled fixture', () => {
  it('still parses upcoming sessions when a gekozen infosessie is shown', () => {
    const html = readFileSync(enrolledFixturePath, 'utf8');
    const rows = parseInfosessionTable(html);

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toMatchObject({
      district: 'Dégage - Dampoort',
      host: 'Host Alpha',
    });
  });
});
