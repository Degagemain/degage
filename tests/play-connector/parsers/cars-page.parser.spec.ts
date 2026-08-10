import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { parseCarsPageTotal } from '@/play-connector/parsers/cars-page.parser';

const fixtures = join(process.cwd(), 'tests/fixtures/play-connector');

describe('parseCarsPageTotal', () => {
  it('returns 0 for an empty search result fixture', () => {
    const html = readFileSync(join(fixtures, 'cars-page-empty.html'), 'utf8');
    expect(parseCarsPageTotal(html)).toBe(0);
  });

  it('returns the total for a hit search result fixture', () => {
    const html = readFileSync(join(fixtures, 'cars-page-hit.html'), 'utf8');
    expect(parseCarsPageTotal(html)).toBe(1);
  });

  it('returns null when pagination is missing', () => {
    expect(parseCarsPageTotal('<div>no pager</div>')).toBeNull();
  });
});
