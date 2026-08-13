import { describe, expect, it } from 'vitest';
import {
  CarOnboardingCarValueStatus,
  CarOnboardingInPreparationStatus,
  CarOnboardingInfoSessionStatus,
  CarOnboardingInsurerStatus,
  CarOnboardingRoadAssistancePlanStatus,
  applyInsurerStatus,
  applyRoadAssistancePlanStatus,
  areCarInfoDocumentsComplete,
  canUpdateInsurer,
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
  ceilToFirstOfMonth,
  getEarliestShareStartDate,
  getLatestShareStartDate,
  isCarInfoSectionComplete,
  isCarOlderThanFourYears,
  isCarStickerSectionComplete,
  isInfoSessionEnrolled,
  isInfoSessionSectionComplete,
  isInsurerContractStartedWithinLastYear,
  isInsurerSectionComplete,
  isPlayConnectorSectionComplete,
  isPreparationConfirmable,
  isPreparationConfirmed,
  isRoadAssistancePlanSectionComplete,
  isShareStartSectionComplete,
  isUserInfoSectionComplete,
  isValidShareStartDate,
  shouldClearShareStartOnInsurerChange,
  startOfMonth,
} from '@/domain/car-onboarding.model';
import { carOnboarding, completeCarOnboarding } from '../builders/car-onboarding.builder';
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
      houseNumber: null,
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
    expect(result.houseNumber).toBeNull();
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
    expect(result.hasExistingRoadAssistancePlan).toBe(false);
    expect(result.existingRoadAssistancePlanEndDate).toBeNull();
    expect(result.roadAssistancePlanDescription).toBeNull();
    expect(result.roadAssistancePlan).toBeNull();
    expect(result.roadAssistancePlanStatus).toBe(CarOnboardingRoadAssistancePlanStatus.TODO);
    expect(result.infoSessionDate).toBeNull();
    expect(result.infoSessionPcId).toBeNull();
    expect(result.infoSessionStatus).toBe(CarOnboardingInfoSessionStatus.TODO);
    expect(result.depreciationCostKm).toBe(0);
    expect(result.seats).toBe(0);
    expect(result.owner).toBeNull();
    expect(result.simulation).toBeNull();
    expect(result.carStickers).toEqual([]);
    expect(result.shareStartDate).toBeNull();
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
  it('requires town and allows nullable street, houseNumber and phone', () => {
    const result = carOnboardingUserInfoInputSchema.safeParse({
      street: null,
      houseNumber: null,
      town: { id: '550e8400-e29b-41d4-a716-446655440099' },
      phone: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing town', () => {
    const result = carOnboardingUserInfoInputSchema.safeParse({
      street: 'Main Street',
      houseNumber: '1',
      phone: '+32 470 00 00 00',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone', () => {
    const result = carOnboardingUserInfoInputSchema.safeParse({
      street: 'Main Street',
      houseNumber: '1',
      town: { id: '550e8400-e29b-41d4-a716-446655440099' },
      phone: 'invalid',
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
      hasInsuranceContract: false,
      insurer: null,
      insurerStatus: CarOnboardingInsurerStatus.TODO,
      insurerContractStartedAt: null,
      insurerAnnouncedPriceIncrease: false,
    });
  });
});

describe('carOnboardingInsurerInputSchema', () => {
  it('requires insurer and contract start date when hasInsuranceContract is true', () => {
    const result = carOnboardingInsurerInputSchema.safeParse({
      hasInsuranceContract: true,
      insurer: { id: '550e8400-e29b-41d4-a716-446655440010' },
      insurerContractStartedAt: '2020-01-15',
    });
    expect(result.success).toBe(true);
  });

  it('accepts hasInsuranceContract false without insurer fields', () => {
    const result = carOnboardingInsurerInputSchema.safeParse({
      hasInsuranceContract: false,
    });
    expect(result.success).toBe(true);
  });

  it('accepts hasInsuranceContract true without insurer fields', () => {
    const result = carOnboardingInsurerInputSchema.safeParse({
      hasInsuranceContract: true,
    });
    expect(result.success).toBe(true);
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
      isPurchased: true,
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
    expect(result.hasInsuranceContract).toBe(false);
    expect(result.isNewCar).toBe(true);
    expect(result.purchasePrice).toBe(25_000);
    expect(result.carValue).toBe(18_000);
    expect(result.depreciationCostKm).toBe(0.12);
    expect(result.owner).toEqual({ id: '550e8400-e29b-41d4-a716-446655440099' });
    expect(result.simulation).toEqual({ id: sim.id });
    expect(result.street).toBeNull();
    expect(result.houseNumber).toBeNull();
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

  it('rounds depreciation cost per km to 4 decimal places', () => {
    const sim = simulation({
      resultDepreciationCostKm: 0.123456789,
    });

    const result = carOnboardingFromSimulation(sim, { ownerId: '550e8400-e29b-41d4-a716-446655440099' });

    expect(result.depreciationCostKm).toBe(0.1235);
  });
});

describe('isCarInfoSectionComplete', () => {
  const catalogFields = {
    brand: { id: '550e8400-e29b-41d4-a716-446655440001' },
    fuelType: { id: '550e8400-e29b-41d4-a716-446655440002' },
    carType: { id: '550e8400-e29b-41d4-a716-446655440003' },
  };

  const registrationDocuments = {
    registrationCertificateFront: { id: '550e8400-e29b-41d4-a716-446655440020' },
    registrationCertificateBack: { id: '550e8400-e29b-41d4-a716-446655440021' },
  };

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

  it('returns true when brand, fuelType, and carType are set with required documents', () => {
    expect(
      isCarInfoSectionComplete(
        carOnboarding({
          ...catalogFields,
          ...registrationDocuments,
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
          ...registrationDocuments,
        }),
      ),
    ).toBe(true);
  });

  it('returns false when catalog fields are set but required documents are missing', () => {
    expect(isCarInfoSectionComplete(carOnboarding(catalogFields))).toBe(false);
  });
});

describe('areCarInfoDocumentsComplete', () => {
  const registrationDocuments = {
    registrationCertificateFront: { id: '550e8400-e29b-41d4-a716-446655440020' },
    registrationCertificateBack: { id: '550e8400-e29b-41d4-a716-446655440021' },
  };

  describe('not purchased', () => {
    it('returns false when registration front or back is missing', () => {
      expect(areCarInfoDocumentsComplete(carOnboarding({ isPurchased: false }))).toBe(false);
      expect(
        areCarInfoDocumentsComplete(
          carOnboarding({
            isPurchased: false,
            registrationCertificateFront: registrationDocuments.registrationCertificateFront,
          }),
        ),
      ).toBe(false);
    });

    it('returns true with registration front and back when car is 4 years old or less', () => {
      const recent = new Date();
      recent.setFullYear(recent.getFullYear() - 2);

      expect(
        areCarInfoDocumentsComplete(
          carOnboarding({
            isPurchased: false,
            firstRegisteredAt: recent,
            ...registrationDocuments,
          }),
        ),
      ).toBe(true);
    });

    it('returns false when car is older than 4 years and inspection certificate is missing', () => {
      const old = new Date();
      old.setFullYear(old.getFullYear() - 5);

      expect(
        areCarInfoDocumentsComplete(
          carOnboarding({
            isPurchased: false,
            firstRegisteredAt: old,
            ...registrationDocuments,
          }),
        ),
      ).toBe(false);
    });

    it('returns true when car is older than 4 years with all required documents', () => {
      const old = new Date();
      old.setFullYear(old.getFullYear() - 5);

      expect(
        areCarInfoDocumentsComplete(
          carOnboarding({
            isPurchased: false,
            firstRegisteredAt: old,
            ...registrationDocuments,
            inspectionCertificate: { id: '550e8400-e29b-41d4-a716-446655440022' },
          }),
        ),
      ).toBe(true);
    });
  });

  describe('purchased, not new', () => {
    it('returns false when pink form is missing', () => {
      expect(areCarInfoDocumentsComplete(carOnboarding({ isPurchased: true, isNewCar: false }))).toBe(false);
    });

    it('returns true when pink form is present', () => {
      expect(
        areCarInfoDocumentsComplete(
          carOnboarding({
            isPurchased: true,
            isNewCar: false,
            pinkForm: { id: '550e8400-e29b-41d4-a716-446655440023' },
          }),
        ),
      ).toBe(true);
    });
  });

  describe('purchased and new', () => {
    it('returns true without documents', () => {
      expect(areCarInfoDocumentsComplete(carOnboarding({ isPurchased: true, isNewCar: true }))).toBe(true);
    });
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

describe('isPreparationConfirmed', () => {
  it('returns true when preparationConfirmedAt is set', () => {
    expect(isPreparationConfirmed(carOnboarding({ preparationConfirmedAt: new Date('2026-06-21T10:00:00') }))).toBe(true);
    expect(isPreparationConfirmed(carOnboarding())).toBe(false);
  });
});

describe('isPreparationConfirmable', () => {
  it('returns true when sections are complete with info session enrolled and not yet confirmed', () => {
    expect(
      isPreparationConfirmable(
        completeCarOnboarding({
          preparationConfirmedAt: null,
          infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
        }),
      ),
    ).toBe(true);
  });

  it('returns false when already confirmed', () => {
    expect(isPreparationConfirmable(completeCarOnboarding())).toBe(false);
  });

  it('returns false when info session is not enrolled', () => {
    expect(
      isPreparationConfirmable(
        completeCarOnboarding({
          preparationConfirmedAt: null,
          infoSessionStatus: CarOnboardingInfoSessionStatus.TODO,
        }),
      ),
    ).toBe(false);
  });

  it('returns false when locked', () => {
    expect(
      isPreparationConfirmable(
        completeCarOnboarding({
          preparationConfirmedAt: null,
          infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
          statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
        }),
      ),
    ).toBe(false);
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
  it('returns false when street, houseNumber, town, or phone is missing', () => {
    expect(isUserInfoSectionComplete(carOnboarding())).toBe(false);
    expect(
      isUserInfoSectionComplete(
        carOnboarding({
          street: 'Main Street',
          houseNumber: '1',
          town: { id: '550e8400-e29b-41d4-a716-446655440099' },
        }),
      ),
    ).toBe(false);
    expect(
      isUserInfoSectionComplete(
        carOnboarding({
          street: 'Main Street',
          town: { id: '550e8400-e29b-41d4-a716-446655440099' },
          phone: '+32 470 00 00 00',
        }),
      ),
    ).toBe(false);
  });

  it('returns true when street, houseNumber, town, and phone are set', () => {
    expect(
      isUserInfoSectionComplete(
        carOnboarding({
          street: 'Main Street',
          houseNumber: '1',
          town: { id: '550e8400-e29b-41d4-a716-446655440099' },
          phone: '+32 470 00 00 00',
        }),
      ),
    ).toBe(true);
  });

  it('returns false when phone format is invalid', () => {
    expect(
      isUserInfoSectionComplete(
        carOnboarding({
          street: 'Main Street',
          houseNumber: '1',
          town: { id: '550e8400-e29b-41d4-a716-446655440099' },
          phone: 'invalid',
        }),
      ),
    ).toBe(false);
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

describe('canUpdateInsurer', () => {
  it('returns true when insurer status is todo', () => {
    expect(canUpdateInsurer(carOnboarding({ insurerStatus: CarOnboardingInsurerStatus.TODO }))).toBe(true);
  });

  it('returns true for purchased cars without insurance when status is not applicable', () => {
    expect(
      canUpdateInsurer(
        carOnboarding({
          isPurchased: true,
          hasInsuranceContract: false,
          insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
        }),
      ),
    ).toBe(true);
  });

  it('returns false when insurer status is ready', () => {
    expect(canUpdateInsurer(carOnboarding({ insurerStatus: CarOnboardingInsurerStatus.READY }))).toBe(false);
  });

  it('returns false for existing cars when status is not applicable', () => {
    expect(
      canUpdateInsurer(
        carOnboarding({
          isPurchased: false,
          hasInsuranceContract: false,
          insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
        }),
      ),
    ).toBe(false);
  });
});

describe('isInsurerContractStartedWithinLastYear', () => {
  it('returns false for null or invalid dates', () => {
    expect(isInsurerContractStartedWithinLastYear(null)).toBe(false);
    expect(isInsurerContractStartedWithinLastYear('invalid')).toBe(false);
  });

  it('returns true when contract started within the last year', () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    expect(isInsurerContractStartedWithinLastYear(sixMonthsAgo)).toBe(true);
  });

  it('returns false when contract started more than a year ago', () => {
    expect(isInsurerContractStartedWithinLastYear(new Date('2020-01-15'))).toBe(false);
  });
});

describe('applyInsurerStatus', () => {
  it('sets not applicable and clears fields when hasInsuranceContract is false', () => {
    const result = applyInsurerStatus(
      carOnboarding({
        isPurchased: false,
        hasInsuranceContract: false,
        insurer: { id: '550e8400-e29b-41d4-a716-446655440010' },
        insurerContractStartedAt: new Date('2020-01-15'),
        insurerStatus: CarOnboardingInsurerStatus.READY,
      }),
    );
    expect(result.insurerStatus).toBe(CarOnboardingInsurerStatus.NOT_APPLICABLE);
    expect(result.insurer).toBeNull();
    expect(result.insurerContractStartedAt).toBeNull();
    expect(result.insurerAnnouncedPriceIncrease).toBe(false);
  });

  it('keeps todo for purchased cars until the insurer step is completed', () => {
    const result = applyInsurerStatus(
      carOnboarding({
        isPurchased: true,
        hasInsuranceContract: false,
        insurerStatus: CarOnboardingInsurerStatus.TODO,
      }),
    );
    expect(result.insurerStatus).toBe(CarOnboardingInsurerStatus.TODO);
  });

  it('sets not applicable for purchased cars after the insurer step is completed', () => {
    const result = applyInsurerStatus(
      carOnboarding({
        isPurchased: true,
        hasInsuranceContract: false,
        insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
      }),
    );
    expect(result.insurerStatus).toBe(CarOnboardingInsurerStatus.NOT_APPLICABLE);
    expect(result.insurer).toBeNull();
    expect(result.insurerContractStartedAt).toBeNull();
  });

  it('sets ready when insurer and date are set', () => {
    const result = applyInsurerStatus(
      carOnboarding({
        hasInsuranceContract: true,
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
          hasInsuranceContract: true,
          insurer: { id: '550e8400-e29b-41d4-a716-446655440010' },
        }),
      ).insurerStatus,
    ).toBe(CarOnboardingInsurerStatus.TODO);
    expect(applyInsurerStatus(carOnboarding({ hasInsuranceContract: true })).insurerStatus).toBe(CarOnboardingInsurerStatus.TODO);
  });

  it('clears insurerAnnouncedPriceIncrease when contract is not within the last year', () => {
    const result = applyInsurerStatus(
      carOnboarding({
        hasInsuranceContract: true,
        insurer: { id: '550e8400-e29b-41d4-a716-446655440010' },
        insurerContractStartedAt: new Date('2020-01-15'),
        insurerAnnouncedPriceIncrease: true,
      }),
    );
    expect(result.insurerAnnouncedPriceIncrease).toBe(false);
  });

  it('keeps insurerAnnouncedPriceIncrease when contract is within the last year', () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const result = applyInsurerStatus(
      carOnboarding({
        hasInsuranceContract: true,
        insurer: { id: '550e8400-e29b-41d4-a716-446655440010' },
        insurerContractStartedAt: sixMonthsAgo,
        insurerAnnouncedPriceIncrease: true,
      }),
    );
    expect(result.insurerAnnouncedPriceIncrease).toBe(true);
  });
});

describe('applyRoadAssistancePlanStatus', () => {
  it('clears existing plan details when hasExistingRoadAssistancePlan is false', () => {
    const result = applyRoadAssistancePlanStatus(
      carOnboarding({
        hasExistingRoadAssistancePlan: false,
        existingRoadAssistancePlanEndDate: new Date('2026-12-31'),
        roadAssistancePlanDescription: 'VAB Europa',
        roadAssistancePlan: { id: '550e8400-e29b-41d4-a716-446655440011' },
      }),
    );
    expect(result.existingRoadAssistancePlanEndDate).toBeNull();
    expect(result.roadAssistancePlanDescription).toBeNull();
    expect(result.roadAssistancePlanStatus).toBe(CarOnboardingRoadAssistancePlanStatus.READY);
  });

  it('sets ready when existing details are complete even without a desired plan', () => {
    expect(
      applyRoadAssistancePlanStatus(
        carOnboarding({
          hasExistingRoadAssistancePlan: false,
          roadAssistancePlan: null,
        }),
      ).roadAssistancePlanStatus,
    ).toBe(CarOnboardingRoadAssistancePlanStatus.READY);

    expect(
      applyRoadAssistancePlanStatus(
        carOnboarding({
          hasExistingRoadAssistancePlan: true,
          existingRoadAssistancePlanEndDate: new Date('2026-12-31'),
          roadAssistancePlanDescription: 'VAB Europa',
        }),
      ).roadAssistancePlanStatus,
    ).toBe(CarOnboardingRoadAssistancePlanStatus.READY);
  });

  it('sets todo when existing end date is missing', () => {
    expect(
      applyRoadAssistancePlanStatus(
        carOnboarding({
          hasExistingRoadAssistancePlan: true,
          roadAssistancePlanDescription: 'VAB Europa',
          roadAssistancePlan: { id: '550e8400-e29b-41d4-a716-446655440011' },
        }),
      ).roadAssistancePlanStatus,
    ).toBe(CarOnboardingRoadAssistancePlanStatus.TODO);
  });

  it('sets todo when existing plan name is missing', () => {
    expect(
      applyRoadAssistancePlanStatus(
        carOnboarding({
          hasExistingRoadAssistancePlan: true,
          existingRoadAssistancePlanEndDate: new Date('2026-12-31'),
          roadAssistancePlanDescription: '   ',
        }),
      ).roadAssistancePlanStatus,
    ).toBe(CarOnboardingRoadAssistancePlanStatus.TODO);
  });

  it('trims the existing plan name when present', () => {
    const result = applyRoadAssistancePlanStatus(
      carOnboarding({
        hasExistingRoadAssistancePlan: true,
        existingRoadAssistancePlanEndDate: new Date('2026-12-31'),
        roadAssistancePlanDescription: '  VAB Europa  ',
      }),
    );
    expect(result.roadAssistancePlanDescription).toBe('VAB Europa');
    expect(result.roadAssistancePlanStatus).toBe(CarOnboardingRoadAssistancePlanStatus.READY);
  });
});

describe('isRoadAssistancePlanSectionComplete', () => {
  it('returns false when status is todo', () => {
    expect(isRoadAssistancePlanSectionComplete(carOnboarding())).toBe(false);
  });

  it('returns true when status is ready', () => {
    expect(isRoadAssistancePlanSectionComplete(carOnboarding({ roadAssistancePlanStatus: CarOnboardingRoadAssistancePlanStatus.READY }))).toBe(
      true,
    );
  });
});

describe('isCarStickerSectionComplete', () => {
  it('returns true when at least one extra sticker is saved', () => {
    expect(isCarStickerSectionComplete(carOnboarding({ carStickers: [{ id: '550e8400-e29b-41d4-a716-446655440012', name: 'Classic' }] }))).toBe(
      true,
    );
  });

  it('returns true when no extra stickers are saved', () => {
    expect(isCarStickerSectionComplete(carOnboarding({ carStickers: [] }))).toBe(true);
  });
});

describe('isCarOlderThanFourYears', () => {
  it('returns false when firstRegisteredAt is null', () => {
    expect(isCarOlderThanFourYears(null)).toBe(false);
  });

  it('returns false when car is less than 4 years old', () => {
    const recent = new Date();
    recent.setFullYear(recent.getFullYear() - 2);
    expect(isCarOlderThanFourYears(recent)).toBe(false);
  });

  it('returns true when car is older than 4 years', () => {
    const old = new Date();
    old.setFullYear(old.getFullYear() - 5);
    expect(isCarOlderThanFourYears(old)).toBe(true);
  });

  it('accepts ISO date strings from API responses', () => {
    const old = new Date();
    old.setFullYear(old.getFullYear() - 5);
    expect(isCarOlderThanFourYears(old.toISOString())).toBe(true);
  });

  it('returns false for invalid date strings', () => {
    expect(isCarOlderThanFourYears('not-a-date')).toBe(false);
  });
});

describe('share start date helpers', () => {
  const today = new Date(2026, 7, 7); // 7 Aug 2026

  it('ceils to the first of the next month when not already the 1st', () => {
    expect(ceilToFirstOfMonth(new Date(2026, 2, 15))).toEqual(new Date(2026, 3, 1));
    expect(ceilToFirstOfMonth(new Date(2026, 2, 1))).toEqual(new Date(2026, 2, 1));
  });

  it('uses the first of the current month when there is no insurance contract', () => {
    expect(getEarliestShareStartDate({ hasInsuranceContract: false, insurerContractStartedAt: null }, today)).toEqual(new Date(2026, 7, 1));
  });

  it('uses contract start plus one year when the contract is less than a year old', () => {
    const contractStart = new Date(2026, 0, 15); // 15 Jan 2026
    expect(getEarliestShareStartDate({ hasInsuranceContract: true, insurerContractStartedAt: contractStart }, today)).toEqual(
      new Date(2027, 1, 1),
    ); // ceil of 15 Jan 2027
  });

  it('uses today plus two months when the contract is a year or older', () => {
    const contractStart = new Date(2024, 0, 15);
    expect(getEarliestShareStartDate({ hasInsuranceContract: true, insurerContractStartedAt: contractStart }, today)).toEqual(
      new Date(2026, 10, 1),
    ); // ceil of 7 Oct 2026 → 1 Nov 2026
  });

  it('caps the latest share start at the first of the month 18 months out', () => {
    expect(getLatestShareStartDate(today)).toEqual(new Date(2028, 1, 1)); // Feb 2028
  });

  it('validates first-of-month dates within earliest and latest', () => {
    const onboarding = { hasInsuranceContract: false, insurerContractStartedAt: null };
    expect(isValidShareStartDate(new Date(2026, 7, 1), onboarding, today)).toBe(true);
    expect(isValidShareStartDate(new Date(2026, 7, 15), onboarding, today)).toBe(false);
    expect(isValidShareStartDate(new Date(2026, 6, 1), onboarding, today)).toBe(false);
    expect(isValidShareStartDate(new Date(2028, 2, 1), onboarding, today)).toBe(false);
  });

  it('marks the section complete when share start date and valid car name are set', () => {
    expect(isShareStartSectionComplete({ shareStartDate: null, carName: null })).toBe(false);
    expect(isShareStartSectionComplete({ shareStartDate: startOfMonth(today), carName: null })).toBe(false);
    expect(isShareStartSectionComplete({ shareStartDate: startOfMonth(today), carName: 'ab' })).toBe(false);
    expect(isShareStartSectionComplete({ shareStartDate: startOfMonth(today), carName: 'abc' })).toBe(true);
    expect(isShareStartSectionComplete({ shareStartDate: startOfMonth(today), carName: 'a!' })).toBe(false);
  });

  it('clears share start when insurance fields that affect earliest date change', () => {
    const shareStartDate = new Date(2026, 10, 1);
    expect(
      shouldClearShareStartOnInsurerChange(
        {
          hasInsuranceContract: true,
          insurerContractStartedAt: new Date(2020, 0, 15),
          shareStartDate,
        },
        {
          hasInsuranceContract: true,
          insurerContractStartedAt: new Date(2021, 5, 1),
        },
        today,
      ),
    ).toBe(true);

    expect(
      shouldClearShareStartOnInsurerChange(
        {
          hasInsuranceContract: true,
          insurerContractStartedAt: new Date(2020, 0, 15),
          shareStartDate,
        },
        {
          hasInsuranceContract: true,
          insurerContractStartedAt: new Date(2020, 0, 15),
        },
        today,
      ),
    ).toBe(false);
  });
});
