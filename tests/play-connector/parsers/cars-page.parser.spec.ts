import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { parseCarsPageNames } from '@/play-connector/parsers/cars-page.parser';

const fixtures = join(process.cwd(), 'tests/fixtures/play-connector');

describe('parseCarsPageNames', () => {
  it('returns no names for an empty search result fixture', () => {
    const html = readFileSync(join(fixtures, 'cars-page-empty.html'), 'utf8');
    expect(parseCarsPageNames(html)).toEqual([]);
  });

  it('returns car names from view links', () => {
    const html = readFileSync(join(fixtures, 'cars-page-hit.html'), 'utf8');
    expect(parseCarsPageNames(html)).toEqual(['TestCar']);
  });

  it('returns an empty list when there are no car view links', () => {
    expect(parseCarsPageNames('<div>no cars</div>')).toEqual([]);
  });
});
