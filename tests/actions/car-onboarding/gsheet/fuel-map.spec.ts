import { describe, expect, it } from 'vitest';

import { mapFuelCodeToSheetLabel } from '@/actions/car-onboarding/gsheet/fuel-map';

describe('mapFuelCodeToSheetLabel', () => {
  it('maps known fuel codes to spreadsheet labels', () => {
    expect(mapFuelCodeToSheetLabel('diesel')).toBe('DIESEL');
    expect(mapFuelCodeToSheetLabel('electric')).toBe('ELEKTRISCH');
    expect(mapFuelCodeToSheetLabel('plugin-hybrid')).toBe('Plugin Hybride');
    expect(mapFuelCodeToSheetLabel('gasoline')).toBe('Benzine');
    expect(mapFuelCodeToSheetLabel('hybrid')).toBe('Hybride');
    expect(mapFuelCodeToSheetLabel('lpg')).toBe('LPG');
    expect(mapFuelCodeToSheetLabel('cng')).toBe('CNG');
    expect(mapFuelCodeToSheetLabel('hydrogen')).toBe('Waterstof');
  });

  it('returns null for unknown codes', () => {
    expect(mapFuelCodeToSheetLabel('petrol')).toBeNull();
    expect(mapFuelCodeToSheetLabel('unknown')).toBeNull();
  });
});
