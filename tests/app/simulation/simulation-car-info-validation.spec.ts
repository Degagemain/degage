import { describe, expect, it } from 'vitest';

import {
  CAR_TYPE_OTHER,
  type SimulationCarInfoValues,
  getSimulationCarInfoFieldErrors,
  isSimulationCarInfoComplete,
  visibleSimulationCarInfoFieldErrors,
} from '@/app/simulation/simulation-car-info-validation';

const now = new Date(2026, 10, 1);

const completeExisting = (): SimulationCarInfoValues => ({
  isCommercialVehicle: false,
  townId: 'town-1',
  brandId: 'brand-1',
  fuelTypeId: 'fuel-1',
  carTypeId: 'type-1',
  carTypeOther: '',
  seats: '5',
  carChoice: 'existing',
  isNewCar: false,
  mileage: '50000',
  firstRegisteredAt: '2020-03-15',
  ownerKmPerYear: '12000',
  purchaseAmountInclVat: '',
});

describe('getSimulationCarInfoFieldErrors', () => {
  it('returns no errors for a complete existing-car form', () => {
    expect(getSimulationCarInfoFieldErrors(completeExisting(), now)).toEqual({});
  });

  it('flags a future first registration date', () => {
    expect(
      getSimulationCarInfoFieldErrors(
        {
          ...completeExisting(),
          firstRegisteredAt: '2026-11-02',
        },
        now,
      ),
    ).toEqual({ firstRegisteredAt: 'future' });
  });

  it('allows today as first registration date', () => {
    expect(
      getSimulationCarInfoFieldErrors(
        {
          ...completeExisting(),
          firstRegisteredAt: '2026-11-01',
        },
        now,
      ),
    ).toEqual({});
  });

  it('flags a missing first registration date', () => {
    expect(
      getSimulationCarInfoFieldErrors(
        {
          ...completeExisting(),
          firstRegisteredAt: '',
        },
        now,
      ),
    ).toEqual({ firstRegisteredAt: 'required' });
  });

  it('skips mileage and registration checks for a brand-new purchase', () => {
    expect(
      getSimulationCarInfoFieldErrors(
        {
          ...completeExisting(),
          carChoice: 'newCar',
          isNewCar: true,
          mileage: '',
          firstRegisteredAt: '',
          purchaseAmountInclVat: '25000',
        },
        now,
      ),
    ).toEqual({});
  });

  it('returns no field errors for commercial vehicles (banner handles it)', () => {
    expect(
      getSimulationCarInfoFieldErrors(
        {
          ...completeExisting(),
          isCommercialVehicle: true,
          firstRegisteredAt: '2026-11-02',
        },
        now,
      ),
    ).toEqual({});
  });
});

describe('isSimulationCarInfoComplete', () => {
  it('is false when primary selects are missing', () => {
    expect(
      isSimulationCarInfoComplete(
        {
          ...completeExisting(),
          townId: '',
        },
        now,
      ),
    ).toBe(false);
  });

  it('is false for a future first registration date', () => {
    expect(
      isSimulationCarInfoComplete(
        {
          ...completeExisting(),
          firstRegisteredAt: '2026-12-01',
        },
        now,
      ),
    ).toBe(false);
  });

  it('is true for a complete form', () => {
    expect(isSimulationCarInfoComplete(completeExisting(), now)).toBe(true);
  });

  it('requires car type other text when Other is selected', () => {
    expect(
      isSimulationCarInfoComplete(
        {
          ...completeExisting(),
          carTypeId: CAR_TYPE_OTHER,
          carTypeOther: '',
        },
        now,
      ),
    ).toBe(false);
  });
});

describe('visibleSimulationCarInfoFieldErrors', () => {
  it('always shows a future date error even before primary selects are filled', () => {
    expect(
      visibleSimulationCarInfoFieldErrors(
        {
          ...completeExisting(),
          townId: '',
          firstRegisteredAt: '2026-12-01',
        },
        now,
      ),
    ).toEqual({ firstRegisteredAt: 'future' });
  });

  it('hides empty-required errors until primary selects are filled', () => {
    expect(
      visibleSimulationCarInfoFieldErrors(
        {
          ...completeExisting(),
          townId: '',
          firstRegisteredAt: '',
          mileage: '',
          ownerKmPerYear: '',
        },
        now,
      ),
    ).toEqual({});
  });

  it('shows empty-required errors once primary selects are filled', () => {
    expect(
      visibleSimulationCarInfoFieldErrors(
        {
          ...completeExisting(),
          firstRegisteredAt: '',
          mileage: '',
          ownerKmPerYear: '',
        },
        now,
      ),
    ).toEqual({
      firstRegisteredAt: 'required',
      mileage: 'invalid',
      ownerKmPerYear: 'invalid',
    });
  });
});
