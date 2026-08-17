import { describe, expect, it } from 'vitest';

import { simulationLoadingVehicleName } from '@/app/simulation/simulation-loading-title';

describe('simulationLoadingVehicleName', () => {
  it('joins brand and car type for a known model', () => {
    expect(
      simulationLoadingVehicleName({
        brandLabel: 'Tesla',
        carTypeName: 'Model 3',
        isOtherCarType: false,
      }),
    ).toBe('Tesla Model 3');
  });

  it('uses only the brand when the car type is Other', () => {
    expect(
      simulationLoadingVehicleName({
        brandLabel: 'Tesla',
        carTypeName: 'Anders',
        isOtherCarType: true,
      }),
    ).toBe('Tesla');
  });

  it('returns null when brand is missing', () => {
    expect(
      simulationLoadingVehicleName({
        brandLabel: '',
        carTypeName: 'Model 3',
        isOtherCarType: false,
      }),
    ).toBeNull();
  });

  it('returns null when car type is missing for a known model', () => {
    expect(
      simulationLoadingVehicleName({
        brandLabel: 'Tesla',
        carTypeName: '',
        isOtherCarType: false,
      }),
    ).toBeNull();
  });
});
