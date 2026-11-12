import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { parseReserveFleet } from '@/play-connector/parsers/reserve-fleet.parser';

const fixture = readFileSync(join(process.cwd(), 'tests/fixtures/play-connector/reserve-fleet.html'), 'utf8');

describe('parseReserveFleet', () => {
  it('reads car id, name, brand and model text, and fuel, and skips bicycles', () => {
    expect(parseReserveFleet(fixture)).toEqual({
      cars: [
        { id: 3801, name: 'Chocolat', brandModel: 'Opel Zafira', fuel: 'Benzine' },
        { id: 2670, name: 'Passata', brandModel: 'Citroën Berlingo', fuel: 'Diesel' },
        { id: 2763, name: 'Lea', brandModel: 'zoe Intens', fuel: 'Elektrisch' },
      ],
      skippedBicycles: 1,
    });
  });
});
