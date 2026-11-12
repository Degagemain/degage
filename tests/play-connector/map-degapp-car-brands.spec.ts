import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { type CatalogCarBrand, type CatalogCarType, buildDegappFleetReport } from '@/play-connector/match-car-brand';
import { parseReserveFleet } from '@/play-connector/parsers/reserve-fleet.parser';

const catalog: CatalogCarBrand[] = [
  { id: 'opel-id', code: 'opel', name: 'Opel', isActive: true },
  { id: 'citroen-id', code: 'citroen', name: 'Citroën', isActive: true },
  { id: 'renault-id', code: 'renault', name: 'Renault', isActive: true },
];

const types: CatalogCarType[] = [
  { id: 'zafira-id', brandId: 'opel-id', fuelCode: 'gasoline', name: 'ZAFIRA', isActive: true },
  { id: 'berlingo-id', brandId: 'citroen-id', fuelCode: 'diesel', name: 'BERLINGO', isActive: true },
];

describe('map Degapp brands from a downloaded fleet page', () => {
  it('matches brands and models from the saved HTML', () => {
    const html = readFileSync(join(process.cwd(), 'tests/fixtures/play-connector/reserve-fleet.html'), 'utf8');
    const fleet = parseReserveFleet(html);
    const report = buildDegappFleetReport(fleet.cars, catalog, types, fleet.skippedBicycles);

    expect(report.cars.map((car) => ({ name: car.name, model: car.model, brand: car.brand.status, type: car.type?.status ?? null }))).toEqual([
      { name: 'Chocolat', model: 'Zafira', brand: 'confident', type: 'confident' },
      { name: 'Passata', model: 'Berlingo', brand: 'confident', type: 'confident' },
      { name: 'Lea', model: 'zoe Intens', brand: 'missing', type: null },
    ]);
    expect(report.missingBrands).toEqual([{ brandModel: 'zoe Intens', count: 1 }]);
    expect(report.missingTypes).toEqual([]);
    expect(report.skippedBicycles).toBe(1);
  });
});
