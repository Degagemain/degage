import { describe, expect, it } from 'vitest';
import {
  CarOnboardingCarValueStatus,
  CarOnboardingInPreparationStatus,
  CarOnboardingInfoSessionStatus,
  CarOnboardingInsurerStatus,
  applyInsurerStatus,
  carOnboardingCarInfoInputSchema,
  carOnboardingCarInfoSchema,
  carOnboardingCarValueCounterInputSchema,
  carOnboardingCarValueResolveInputSchema,
  carOnboardingCarValueSchema,
  carOnboardingCreateInputSchema,
  carOnboardingFromSimulation,
  carOnboardingInfoSessionEnrollInputSchema,
  carOnboardingInfoSessionSchema,
  carOnboardingInsurerInputSchema,
  carOnboardingInsurerSchema,
  carOnboardingSchema,
  carOnboardingUserInfoInputSchema,
  carOnboardingUserInfoSchema,
  isCarInfoSectionComplete,
  isInfoSessionEnrolled,
  isInfoSessionSectionComplete,
  isInsurerSectionComplete,
  isPlayConnectorSectionComplete,
  isUserInfoSectionComplete,
} from '@/domain/car-onboarding.model';
import { carOnboarding } from '../builders/car-onboarding.builder';
import { simulation } from '../builders/simulation.builder';

describe('carOnboardingCarInfoSchema', () => {
  it('defaults nullable relation fields to null', () => {
    const result = carOnboardingCarInfoSchema.parse({});
    expect(result).toEqual({
      brand: null,
      fuelType: null,
      carType: null,
    });
  });
});

describe('carOnboardingUserInfoSchema', () => {
  it('defaults nullable fields to null', () => {
    const result = carOnboardingUserInfoSchema.parse({});
    expect(result).toEqual({
      street: null,
      town: null,
      phone: null,
    });
  });
});

describe('carOnboardingSchema', () => {
  it('merges section schemas and applies defaults', () => {
    const result = carOnboardingSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(result.brand).toBeNull();
    expect(result.fuelType).toBeNull();
    expect(result.carType).toBeNull();
    expect(result.street).toBeNull();
    expect(result.town).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.mileage).toBe(0);
    expect(result.purchasePrice).toBe(0);
    expect(result.carValue).toBe(0);
    expect(result.carValueCounterProposal).toBe(0);
    expect(result.carValueCounterProposalMessage).toBeNull();
    expect(result.carValueStatus).toBe(CarOnboardingCarValueStatus.TODO);
    expect(result.insurer).toBeNull();
    expect(result.insurerStatus).toBe(CarOnboardingInsurerStatus.TODO);
    expect(result.insurerContractStartedAt).toBeNull();
    expect(result.infoSessionDate).toBeNull();
    expect(result.infoSessionPcId).toBeNull();
    expect(result.infoSessionStatus).toBe(CarOnboardingInfoSessionStatus.TODO);
    expect(result.depreciationCostKm).toBe(0);
    expect(result.seats).toBe(0);
    expect(result.owner).toBeNull();
    expect(result.simulation).toBeNull();
    expect(result.statusInPreparation).toBe(CarOnboardingInPreparationStatus.OPEN);
  });

  it('rejects unknown keys', () => {
    const result = carOnboardingSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      unknown: true,
    });
    expect(result.success).toBe(false);
  });

  it('accepts non-uuid owner ids', () => {
    const result = carOnboardingSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      owner: { id: 'better-auth-user-id' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts read-only hasPlayConnector on owner', () => {
    const result = carOnboardingSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      owner: { id: 'better-auth-user-id', name: 'Jane Doe', hasPlayConnector: true },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.owner?.hasPlayConnector).toBe(true);
    }
  });
});

describe('carOnboardingCarInfoInputSchema', () => {
  it('requires non-null brand, fuelType, and carType', () => {
    const result = carOnboardingCarInfoInputSchema.safeParse({
      brand: { id: '550e8400-e29b-41d4-a716-446655440001' },
      fuelType: { id: '550e8400-e29b-41d4-a716-446655440002' },
      carType: { id: '550e8400-e29b-41d4-a716-446655440003' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing carType', () => {
    const result = carOnboardingCarInfoInputSchema.safeParse({
      brand: { id: '550e8400-e29b-41d4-a716-446655440001' },
      fuelType: { id: '550e8400-e29b-41d4-a716-446655440002' },
    });
    expect(result.success).toBe(false);
  });
});

describe('carOnboardingUserInfoInputSchema', () => {
  it('requires town and allows nullable street and phone', () => {
    const result = carOnboardingUserInfoInputSchema.safeParse({
      street: null,
      town: { id: '550e8400-e29b-41d4-a716-446655440099' },
      phone: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing town', () => {
    const result = carOnboardingUserInfoInputSchema.safeParse({
      street: 'Main Street',
      phone: '+32 470 00 00 00',
    });
    expect(result.success).toBe(false);
  });
});

describe('carOnboardingInfoSessionSchema', () => {
  it('defaults info session fields', () => {
    const result = carOnboardingInfoSessionSchema.parse({});
    expect(result).toEqual({
      infoSessionDate: null,
      infoSessionPcId: null,
      infoSessionStatus: CarOnboardingInfoSessionStatus.TODO,
    });
  });
});

describe('carOnboardingInfoSessionEnrollInputSchema', () => {
  it('requires date and pc id', () => {
    const result = carOnboardingInfoSessionEnrollInputSchema.safeParse({
      infoSessionDate: '2026-06-20T09:25:00.000Z',
      infoSessionPcId: '1359',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty pc id', () => {
    const result = carOnboardingInfoSessionEnrollInputSchema.safeParse({
      infoSessionDate: '2026-06-20T09:25:00.000Z',
      infoSessionPcId: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('carOnboardingInsurerSchema', () => {
  it('defaults insurer fields', () => {
    const result = carOnboardingInsurerSchema.parse({});
    expect(result).toEqual({
      insurer: null,
      insurerStatus: CarOnboardingInsurerStatus.TODO,
      insurerContractStartedAt: null,
    });
  });
});

describe('carOnboardingInsurerInputSchema', () => {
  it('requires insurer and contract start date', () => {
    const result = carOnboardingInsurerInputSchema.safeParse({
      insurer: { id: '550e8400-e29b-41d4-a716-446655440010' },
      insurerContractStartedAt: '2020-01-15',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing insurer', () => {
    const result = carOnboardingInsurerInputSchema.safeParse({
      insurerContractStartedAt: '2020-01-15',
    });
    expect(result.success).toBe(false);
  });
});

describe('carOnboardingCarValueSchema', () => {
  it('defaults car value fields', () => {
    const result = carOnboardingCarValueSchema.parse({});
    expect(result).toEqual({
      carValue: 0,
      carValueCounterProposal: 0,
      carValueCounterProposalMessage: null,
      carValueStatus: CarOnboardingCarValueStatus.TODO,
    });
  });
});

describe('carOnboardingCarValueCounterInputSchema', () => {
  it('accepts counter proposal with nullable message', () => {
    const result = carOnboardingCarValueCounterInputSchema.safeParse({
      carValueCounterProposal: 15_000,
      carValueCounterProposalMessage: null,
    });
    expect(result.success).toBe(true);
  });
});

describe('carOnboardingCarValueResolveInputSchema', () => {
  it('accepts only resolved status', () => {
    const result = carOnboardingCarValueResolveInputSchema.safeParse({
      carValueStatus: CarOnboardingCarValueStatus.RESOLVED,
    });
    expect(result.success).toBe(true);
  });

  it('rejects other statuses', () => {
    const result = carOnboardingCarValueResolveInputSchema.safeParse({
      carValueStatus: CarOnboardingCarValueStatus.PROPOSAL,
    });
    expect(result.success).toBe(false);
  });
});

describe('carOnboardingCreateInputSchema', () => {
  it('accepts empty body', () => {
    const result = carOnboardingCreateInputSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts simulation id', () => {
    const result = carOnboardingCreateInputSchema.safeParse({
      simulation: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts admin car type flags', () => {
    const result = carOnboardingCreateInputSchema.safeParse({
      isPurchased: true,
      isNewCar: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects isNewCar without isPurchased', () => {
    const result = carOnboardingCreateInputSchema.safeParse({
      isPurchased: false,
      isNewCar: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown keys', () => {
    const result = carOnboardingCreateInputSchema.safeParse({ owner: { id: 'x' } });
    expect(result.success).toBe(false);
  });
});

describe('carOnboardingFromSimulation', () => {
  it('maps overlapping fields and links simulation', () => {
    const sim = simulation({
      id: '550e8400-e29b-41d4-a716-446655440010',
      isNewCar: true,
      purchasePrice: 25_000,
      resultEstimatedCarValue: 18_000,
      resultDepreciationCostKm: 0.12,
      carType: { id: '550e8400-e29b-41d4-a716-446655440003', name: 'A4' },
      carTypeOther: 'Custom',
    });

    const result = carOnboardingFromSimulation(sim, { ownerId: '550e8400-e29b-41d4-a716-446655440099' });

    expect(result.town).toEqual({ id: sim.town.id });
    expect(result.brand).toEqual({ id: sim.brand.id });
    expect(result.fuelType).toEqual({ id: sim.fuelType.id });
    expect(result.carType).toEqual({ id: sim.carType!.id });
    expect(result.carTypeOther).toBe('Custom');
    expect(result.mileage).toBe(sim.mileage);
    expect(result.seats).toBe(sim.seats);
    expect(result.firstRegisteredAt).toEqual(sim.firstRegisteredAt);
    expect(result.isVan).toBe(sim.isVan);
    expect(result.isPurchased).toBe(true);
    expect(result.isNewCar).toBe(true);
    expect(result.purchasePrice).toBe(25_000);
    expect(result.carValue).toBe(18_000);
    expect(result.depreciationCostKm).toBe(0.12);
    expect(result.owner).toEqual({ id: '550e8400-e29b-41d4-a716-446655440099' });
    expect(result.simulation).toEqual({ id: sim.id });
    expect(result.street).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.carValueStatus).toBe(CarOnboardingCarValueStatus.TODO);
    expect(result.insurer).toBeNull();
    expect(result.insurerContractStartedAt).toBeNull();
    expect(result.insurerStatus).toBe(CarOnboardingInsurerStatus.TODO);
    expect(result.infoSessionDate).toBeNull();
    expect(result.infoSessionPcId).toBeNull();
    expect(result.infoSessionStatus).toBe(CarOnboardingInfoSessionStatus.TODO);
    expect(result.statusInPreparation).toBe(CarOnboardingInPreparationStatus.OPEN);
  });

  it('defaults null purchase price and result fields to zero', () => {
    const sim = simulation({
      purchasePrice: null,
      resultEstimatedCarValue: null,
      resultDepreciationCostKm: null,
    });

    const result = carOnboardingFromSimulation(sim, { ownerId: '550e8400-e29b-41d4-a716-446655440099' });

    expect(result.purchasePrice).toBe(0);
    expect(result.carValue).toBe(0);
    expect(result.depreciationCostKm).toBe(0);
  });
});

describe('isCarInfoSectionComplete', () => {
  it('returns false when any car relation is missing', () => {
    expect(isCarInfoSectionComplete(carOnboarding())).toBe(false);
    expect(
      isCarInfoSectionComplete(
        carOnboarding({
          brand: { id: '550e8400-e29b-41d4-a716-446655440001' },
          fuelType: { id: '550e8400-e29b-41d4-a716-446655440002' },
        }),
      ),
    ).toBe(false);
  });

  it('returns true when brand, fuelType, and carType are set', () => {
    expect(
      isCarInfoSectionComplete(
        carOnboarding({
          brand: { id: '550e8400-e29b-41d4-a716-446655440001' },
          fuelType: { id: '550e8400-e29b-41d4-a716-446655440002' },
          carType: { id: '550e8400-e29b-41d4-a716-446655440003' },
        }),
      ),
    ).toBe(true);
  });

  it('returns true when car type other is set without catalog car type', () => {
    expect(
      isCarInfoSectionComplete(
        carOnboarding({
          brand: { id: '550e8400-e29b-41d4-a716-446655440001' },
          fuelType: { id: '550e8400-e29b-41d4-a716-446655440002' },
          carType: null,
          carTypeOther: 'Custom model',
        }),
      ),
    ).toBe(true);
  });
});

describe('isInfoSessionSectionComplete', () => {
  it('returns true only when info session status is done', () => {
    expect(isInfoSessionSectionComplete(carOnboarding({ infoSessionStatus: CarOnboardingInfoSessionStatus.DONE }))).toBe(true);
    expect(isInfoSessionSectionComplete(carOnboarding({ infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED }))).toBe(false);
    expect(isInfoSessionSectionComplete(carOnboarding())).toBe(false);
  });
});

describe('isInfoSessionEnrolled', () => {
  it('returns true when status is enrolled or done', () => {
    expect(isInfoSessionEnrolled(carOnboarding({ infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED }))).toBe(true);
    expect(isInfoSessionEnrolled(carOnboarding({ infoSessionStatus: CarOnboardingInfoSessionStatus.DONE }))).toBe(true);
    expect(isInfoSessionEnrolled(carOnboarding())).toBe(false);
  });
});

describe('isPlayConnectorSectionComplete', () => {
  it('returns true only when owner has play connector configured', () => {
    expect(isPlayConnectorSectionComplete(carOnboarding({ owner: { id: 'owner-1', hasPlayConnector: true } }))).toBe(true);
    expect(isPlayConnectorSectionComplete(carOnboarding({ owner: { id: 'owner-1' } }))).toBe(false);
    expect(isPlayConnectorSectionComplete(carOnboarding())).toBe(false);
  });
});

describe('isUserInfoSectionComplete', () => {
  it('returns false when street, town, or phone is missing', () => {
    expect(isUserInfoSectionComplete(carOnboarding())).toBe(false);
    expect(
      isUserInfoSectionComplete(
        carOnboarding({
          street: 'Main Street',
          town: { id: '550e8400-e29b-41d4-a716-446655440099' },
        }),
      ),
    ).toBe(false);
  });

  it('returns true when street, town, and phone are set', () => {
    expect(
      isUserInfoSectionComplete(
        carOnboarding({
          street: 'Main Street',
          town: { id: '550e8400-e29b-41d4-a716-446655440099' },
          phone: '+32 470 00 00 00',
        }),
      ),
    ).toBe(true);
  });
});

describe('isInsurerSectionComplete', () => {
  it('returns false when insurer status is todo', () => {
    expect(isInsurerSectionComplete(carOnboarding({ insurerStatus: CarOnboardingInsurerStatus.TODO }))).toBe(false);
  });

  it('returns true when insurer status is ready or not applicable', () => {
    expect(isInsurerSectionComplete(carOnboarding({ insurerStatus: CarOnboardingInsurerStatus.READY }))).toBe(true);
    expect(isInsurerSectionComplete(carOnboarding({ insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE }))).toBe(true);
  });
});

describe('applyInsurerStatus', () => {
  it('sets not applicable and clears fields when purchased', () => {
    const result = applyInsurerStatus(
      carOnboarding({
        isPurchased: true,
        insurer: { id: '550e8400-e29b-41d4-a716-446655440010' },
        insurerContractStartedAt: new Date('2020-01-15'),
        insurerStatus: CarOnboardingInsurerStatus.READY,
      }),
    );
    expect(result.insurerStatus).toBe(CarOnboardingInsurerStatus.NOT_APPLICABLE);
    expect(result.insurer).toBeNull();
    expect(result.insurerContractStartedAt).toBeNull();
  });

  it('sets ready when insurer and date are set', () => {
    const result = applyInsurerStatus(
      carOnboarding({
        insurer: { id: '550e8400-e29b-41d4-a716-446655440010' },
        insurerContractStartedAt: new Date('2020-01-15'),
      }),
    );
    expect(result.insurerStatus).toBe(CarOnboardingInsurerStatus.READY);
  });

  it('sets todo when insurer or date is missing', () => {
    expect(
      applyInsurerStatus(
        carOnboarding({
          insurer: { id: '550e8400-e29b-41d4-a716-446655440010' },
        }),
      ).insurerStatus,
    ).toBe(CarOnboardingInsurerStatus.TODO);
    expect(applyInsurerStatus(carOnboarding()).insurerStatus).toBe(CarOnboardingInsurerStatus.TODO);
  });
});
