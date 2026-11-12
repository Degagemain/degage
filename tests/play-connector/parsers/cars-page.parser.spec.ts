import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { parseCarsPageNames, parseCarsPageRows } from '@/play-connector/parsers/cars-page.parser';

const fixtures = join(process.cwd(), 'tests/fixtures/play-connector');

describe('parseCarsPageNames', () => {
  it('returns no names for an empty search result fixture', () => {
    const html = readFileSync(join(fixtures, 'cars-page-empty.html'), 'utf8');
    expect(parseCarsPageNames(html)).toEqual([]);
  });

  it('returns car names from view links', () => {
    const html = readFileSync(join(fixtures, 'cars-page-hit.html'), 'utf8');
    expect(parseCarsPageNames(html)).toEqual(['TestCar', 'SecondCar', 'ParkedCar']);
  });

  it('returns an empty list when there are no car view links', () => {
    expect(parseCarsPageNames('<div>no cars</div>')).toEqual([]);
  });
});

describe('parseCarsPageRows', () => {
  it('returns no rows for an empty search result fixture', () => {
    const html = readFileSync(join(fixtures, 'cars-page-empty.html'), 'utf8');
    expect(parseCarsPageRows(html)).toEqual([]);
  });

  it('reads id, name, brand, and active from the cars table', () => {
    const html = readFileSync(join(fixtures, 'cars-page-hit.html'), 'utf8');
    expect(parseCarsPageRows(html)).toEqual([
      { id: 100, name: 'TestCar', brand: 'Opel', active: true },
      { id: 101, name: 'SecondCar', brand: 'Volkswagen', active: true },
      { id: 102, name: 'ParkedCar', brand: 'Opel', active: false },
    ]);
  });

  it('ignores markup that is not the cars table', () => {
    expect(parseCarsPageRows('<a href="/cars/view?id=3493">2BAB</a>')).toEqual([]);
  });
});
