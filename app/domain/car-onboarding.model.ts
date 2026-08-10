import * as z from 'zod';

import { idNameSchema, userReferenceSchema } from '@/domain/id-name.model';
import { isValidPhoneNumber, nullablePhoneNumberSchema } from '@/domain/phone.model';

export const carOnboardingOwnerSchema = userReferenceSchema.extend({
  hasPlayConnector: z.boolean().optional(),
});

export type CarOnboardingOwner = z.infer<typeof carOnboardingOwnerSchema>;
import type { Simulation } from '@/domain/simulation.model';

export enum CarOnboardingInPreparationStatus {
  OPEN = 'open',
  READY = 'ready',
  LOCKED = 'locked',
}

export enum CarOnboardingCarValueStatus {
  TODO = 'todo',
  PROPOSAL = 'proposal',
  COUNTER = 'counter',
  RESOLVED = 'resolved',
}

export enum CarOnboardingInsurerStatus {
  NOT_APPLICABLE = 'notApplicable',
  TODO = 'todo',
  READY = 'ready',
}

export enum CarOnboardingRoadAssistancePlanStatus {
  TODO = 'todo',
  READY = 'ready',
}

export enum CarOnboardingInfoSessionStatus {
  TODO = 'todo',
  ENROLLED = 'enrolled',
  DONE = 'done',
}

export const carOnboardingCarInfoSchema = z
  .object({
    brand: idNameSchema.nullable().default(null),
    fuelType: idNameSchema.nullable().default(null),
    carType: idNameSchema.nullable().default(null),
  })
  .strict();

export const carOnboardingUserInfoSchema = z
  .object({
    street: z.string().nullable().default(null),
    town: idNameSchema.nullable().default(null),
    phone: z.string().nullable().default(null),
  })
  .strict();

export const carOnboardingCarValueSchema = z
  .object({
    carValue: z.number().min(0).default(0),
    carValueCounterProposal: z.number().min(0).default(0),
    carValueCounterProposalMessage: z.string().nullable().default(null),
    carValueStatus: z.enum(CarOnboardingCarValueStatus).default(CarOnboardingCarValueStatus.TODO),
  })
  .strict();

export const carOnboardingInsurerSchema = z
  .object({
    hasInsuranceContract: z.boolean().default(false),
    insurer: idNameSchema.nullable().default(null),
    insurerStatus: z.enum(CarOnboardingInsurerStatus).default(CarOnboardingInsurerStatus.TODO),
    insurerContractStartedAt: z.coerce.date().nullable().default(null),
    insurerAnnouncedPriceIncrease: z.boolean().default(false),
  })
  .strict();

export const carOnboardingRoadAssistancePlanSchema = z
  .object({
    hasExistingRoadAssistancePlan: z.boolean().default(false),
    existingRoadAssistancePlanEndDate: z.coerce.date().nullable().default(null),
    roadAssistancePlan: idNameSchema.nullable().default(null),
    roadAssistancePlanStatus: z.enum(CarOnboardingRoadAssistancePlanStatus).default(CarOnboardingRoadAssistancePlanStatus.TODO),
  })
  .strict();

export const carOnboardingInfoSessionSchema = z
  .object({
    infoSessionDate: z.coerce.date().nullable().default(null),
    infoSessionPcId: z.string().nullable().default(null),
    infoSessionStatus: z.enum(CarOnboardingInfoSessionStatus).default(CarOnboardingInfoSessionStatus.TODO),
  })
  .strict();

export type CarOnboardingCarInfo = z.infer<typeof carOnboardingCarInfoSchema>;
export type CarOnboardingUserInfo = z.infer<typeof carOnboardingUserInfoSchema>;
export type CarOnboardingCarValue = z.infer<typeof carOnboardingCarValueSchema>;
export type CarOnboardingInsurer = z.infer<typeof carOnboardingInsurerSchema>;
export type CarOnboardingRoadAssistancePlan = z.infer<typeof carOnboardingRoadAssistancePlanSchema>;
export type CarOnboardingInfoSession = z.infer<typeof carOnboardingInfoSessionSchema>;

export const carOnboardingSchema = carOnboardingCarInfoSchema
  .merge(carOnboardingUserInfoSchema)
  .merge(carOnboardingCarValueSchema)
  .merge(carOnboardingInsurerSchema)
  .merge(carOnboardingRoadAssistancePlanSchema)
  .merge(carOnboardingInfoSessionSchema)
  .extend({
    id: z.uuid().nullable(),
    carTypeOther: z.string().nullable().default(null),
    isPurchased: z.boolean().default(false),
    purchasePrice: z.number().min(0).default(0),
    depreciationCostKm: z.number().min(0).default(0),
    isNewCar: z.boolean().default(false),
    mileage: z.number().int().min(0).default(0),
    vin: z.string().nullable().default(null),
    plate: z.string().nullable().default(null),
    firstRegisteredAt: z.coerce.date().nullable().default(null),
    seats: z.number().int().min(0).default(0),
    isVan: z.boolean().default(false),
    owner: carOnboardingOwnerSchema.nullable().default(null),
    simulation: idNameSchema.nullable().default(null),
    registrationCertificateFront: idNameSchema.nullable().default(null),
    registrationCertificateBack: idNameSchema.nullable().default(null),
    inspectionCertificate: idNameSchema.nullable().default(null),
    pinkForm: idNameSchema.nullable().default(null),
    carStickers: z.array(idNameSchema).default([]),
    carName: z.string().nullable().default(null),
    shareStartDate: z.coerce.date().nullable().default(null),
    preparationConfirmedAt: z.coerce.date().nullable().default(null),
    statusInPreparation: z.enum(CarOnboardingInPreparationStatus).default(CarOnboardingInPreparationStatus.OPEN),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type CarOnboarding = z.infer<typeof carOnboardingSchema>;

export const CAR_ONBOARDING_CAR_NAME_MIN_LENGTH = 2;
export const CAR_ONBOARDING_CAR_NAME_MAX_LENGTH = 50;
export const carOnboardingCarNamePattern = /^[A-Za-z0-9]+$/;

export const carOnboardingCarNameSchema = z
  .string()
  .min(CAR_ONBOARDING_CAR_NAME_MIN_LENGTH)
  .max(CAR_ONBOARDING_CAR_NAME_MAX_LENGTH)
  .regex(carOnboardingCarNamePattern);

export const carOnboardingCarInfoInputSchema = carOnboardingCarInfoSchema
  .pick({ brand: true, fuelType: true, carType: true })
  .extend({
    brand: idNameSchema,
    fuelType: idNameSchema,
    carType: idNameSchema,
  })
  .strict();

export type CarOnboardingCarInfoInput = z.infer<typeof carOnboardingCarInfoInputSchema>;

export const carOnboardingUserInfoInputSchema = carOnboardingUserInfoSchema
  .pick({ street: true, town: true, phone: true })
  .extend({
    town: idNameSchema,
    phone: nullablePhoneNumberSchema,
  })
  .strict();

export type CarOnboardingUserInfoInput = z.infer<typeof carOnboardingUserInfoInputSchema>;

export const carOnboardingCarValueCounterInputSchema = carOnboardingCarValueSchema
  .pick({ carValueCounterProposal: true, carValueCounterProposalMessage: true })
  .extend({
    carValueCounterProposal: z.number().min(0),
    carValueCounterProposalMessage: z.string().nullable(),
  })
  .strict();

export type CarOnboardingCarValueCounterInput = z.infer<typeof carOnboardingCarValueCounterInputSchema>;

export const carOnboardingCarValueResolveInputSchema = z
  .object({
    carValueStatus: z.literal(CarOnboardingCarValueStatus.RESOLVED),
  })
  .strict();

export type CarOnboardingCarValueResolveInput = z.infer<typeof carOnboardingCarValueResolveInputSchema>;

export const carOnboardingInsurerInputSchema = z
  .object({
    hasInsuranceContract: z.boolean(),
    insurer: idNameSchema.nullable().optional(),
    insurerContractStartedAt: z.coerce.date().nullable().optional(),
    insurerAnnouncedPriceIncrease: z.boolean().optional(),
  })
  .strict();

export type CarOnboardingInsurerInput = z.infer<typeof carOnboardingInsurerInputSchema>;

export const carOnboardingRoadAssistancePlanInputSchema = z
  .object({
    hasExistingRoadAssistancePlan: z.boolean(),
    existingRoadAssistancePlanEndDate: z.coerce.date().nullable().optional(),
    roadAssistancePlan: idNameSchema.nullable().optional(),
  })
  .strict();

export type CarOnboardingRoadAssistancePlanInput = z.infer<typeof carOnboardingRoadAssistancePlanInputSchema>;

export const carOnboardingInfoSessionEnrollInputSchema = carOnboardingInfoSessionSchema
  .pick({ infoSessionDate: true, infoSessionPcId: true })
  .extend({
    infoSessionDate: z.coerce.date(),
    infoSessionPcId: z.string().min(1),
  })
  .strict();

export type CarOnboardingInfoSessionEnrollInput = z.infer<typeof carOnboardingInfoSessionEnrollInputSchema>;

export const carOnboardingCarStickersInputSchema = z
  .object({
    carStickers: z.array(idNameSchema),
  })
  .strict();

export type CarOnboardingCarStickersInput = z.infer<typeof carOnboardingCarStickersInputSchema>;

export const carOnboardingShareStartInputSchema = z
  .object({
    shareStartDate: z.coerce.date(),
    carName: carOnboardingCarNameSchema,
  })
  .strict();

export type CarOnboardingShareStartInput = z.infer<typeof carOnboardingShareStartInputSchema>;

export const carOnboardingCreateInputSchema = z
  .object({
    simulation: idNameSchema.optional(),
    isPurchased: z.boolean().optional(),
    isNewCar: z.boolean().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.isNewCar === true && data.isPurchased !== true) {
      ctx.addIssue({
        code: 'custom',
        message: 'isNewCar requires isPurchased',
        path: ['isNewCar'],
      });
    }
  });

export type CarOnboardingCreateInput = z.infer<typeof carOnboardingCreateInputSchema>;

export const hasInsuranceContractFromIsPurchased = (isPurchased: boolean): boolean => !isPurchased;

export const carOnboardingFromSimulation = (
  simulation: Simulation,
  options: { ownerId: string },
): Omit<CarOnboarding, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    street: null,
    town: { id: simulation.town.id },
    phone: null,
    brand: { id: simulation.brand.id },
    fuelType: { id: simulation.fuelType.id },
    carType: simulation.carType != null ? { id: simulation.carType.id } : null,
    carTypeOther: simulation.carTypeOther,
    isPurchased: simulation.isPurchased,
    purchasePrice: simulation.purchasePrice ?? 0,
    carValue: simulation.resultEstimatedCarValue ?? 0,
    carValueCounterProposal: 0,
    carValueCounterProposalMessage: null,
    carValueStatus: CarOnboardingCarValueStatus.TODO,
    hasInsuranceContract: hasInsuranceContractFromIsPurchased(simulation.isPurchased),
    insurer: null,
    insurerContractStartedAt: null,
    insurerAnnouncedPriceIncrease: false,
    insurerStatus: CarOnboardingInsurerStatus.TODO,
    hasExistingRoadAssistancePlan: false,
    existingRoadAssistancePlanEndDate: null,
    roadAssistancePlan: null,
    roadAssistancePlanStatus: CarOnboardingRoadAssistancePlanStatus.TODO,
    depreciationCostKm: simulation.resultDepreciationCostKm != null ? Math.round(simulation.resultDepreciationCostKm * 10000) / 10000 : 0,
    isNewCar: simulation.isNewCar,
    mileage: simulation.mileage,
    vin: null,
    plate: null,
    firstRegisteredAt: simulation.firstRegisteredAt,
    seats: simulation.seats,
    isVan: simulation.isVan,
    owner: { id: options.ownerId },
    simulation: simulation.id != null ? { id: simulation.id } : null,
    registrationCertificateFront: null,
    registrationCertificateBack: null,
    inspectionCertificate: null,
    pinkForm: null,
    carStickers: [],
    carName: null,
    shareStartDate: null,
    statusInPreparation: CarOnboardingInPreparationStatus.OPEN,
    preparationConfirmedAt: null,
    infoSessionDate: null,
    infoSessionPcId: null,
    infoSessionStatus: CarOnboardingInfoSessionStatus.TODO,
  };
};

const isNonEmptyString = (value: string | null | undefined): boolean => {
  return value != null && value.trim().length > 0;
};

export const isInsurerContractStartedWithinLastYear = (startedAt: Date | string | null): boolean => {
  if (startedAt == null) return false;
  const parsed = startedAt instanceof Date ? startedAt : new Date(startedAt);
  if (Number.isNaN(parsed.getTime())) return false;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return parsed.getTime() > oneYearAgo.getTime();
};

export const isCarOlderThanFourYears = (firstRegisteredAt: Date | string | null): boolean => {
  if (firstRegisteredAt == null) return false;
  const parsed = firstRegisteredAt instanceof Date ? firstRegisteredAt : new Date(firstRegisteredAt);
  if (Number.isNaN(parsed.getTime())) return false;
  const threshold = new Date();
  threshold.setFullYear(threshold.getFullYear() - 4);
  return parsed.getTime() < threshold.getTime();
};

type CarInfoDocumentsFields = Pick<
  CarOnboarding,
  | 'isPurchased'
  | 'isNewCar'
  | 'firstRegisteredAt'
  | 'registrationCertificateFront'
  | 'registrationCertificateBack'
  | 'inspectionCertificate'
  | 'pinkForm'
>;

export const areCarInfoDocumentsComplete = (onboarding: CarInfoDocumentsFields): boolean => {
  if (onboarding.isPurchased) {
    if (onboarding.isNewCar) {
      return true;
    }
    return onboarding.pinkForm != null;
  }

  if (onboarding.registrationCertificateFront == null || onboarding.registrationCertificateBack == null) {
    return false;
  }

  if (isCarOlderThanFourYears(onboarding.firstRegisteredAt)) {
    return onboarding.inspectionCertificate != null;
  }

  return true;
};

export const isCarInfoSectionComplete = (
  onboarding: Pick<CarOnboarding, 'brand' | 'fuelType' | 'carType' | 'carTypeOther'> & CarInfoDocumentsFields,
): boolean => {
  const catalogComplete =
    onboarding.brand != null && onboarding.fuelType != null && (onboarding.carType != null || isNonEmptyString(onboarding.carTypeOther));
  return catalogComplete && areCarInfoDocumentsComplete(onboarding);
};

export const isCarValueProposedToOwner = (onboarding: Pick<CarOnboarding, 'carValueStatus' | 'carValue'>): boolean => {
  if (onboarding.carValueStatus === CarOnboardingCarValueStatus.PROPOSAL) return true;
  return onboarding.carValueStatus === CarOnboardingCarValueStatus.TODO && onboarding.carValue > 0;
};

export const isUserInfoSectionComplete = (onboarding: CarOnboardingUserInfo): boolean => {
  return isNonEmptyString(onboarding.street) && onboarding.town != null && onboarding.phone != null && isValidPhoneNumber(onboarding.phone);
};

export const isPlayConnectorSectionComplete = (onboarding: Pick<CarOnboarding, 'owner'>): boolean => {
  return onboarding.owner?.hasPlayConnector === true;
};

export const isInfoSessionSectionComplete = (onboarding: Pick<CarOnboarding, 'infoSessionStatus'>): boolean => {
  return onboarding.infoSessionStatus === CarOnboardingInfoSessionStatus.DONE;
};

export const isInfoSessionEnrolled = (onboarding: Pick<CarOnboarding, 'infoSessionStatus'>): boolean => {
  return (
    onboarding.infoSessionStatus === CarOnboardingInfoSessionStatus.ENROLLED ||
    onboarding.infoSessionStatus === CarOnboardingInfoSessionStatus.DONE
  );
};

export const isInsurerSectionComplete = (onboarding: Pick<CarOnboarding, 'insurerStatus'>): boolean => {
  return onboarding.insurerStatus !== CarOnboardingInsurerStatus.TODO;
};

const parseDate = (value: Date | string): Date | null => {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

export const ceilToFirstOfMonth = (date: Date): Date => {
  if (date.getDate() === 1) return startOfMonth(date);
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
};

const addCalendarMonths = (date: Date, months: number): Date => {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
};

const addCalendarYears = (date: Date, years: number): Date => {
  return new Date(date.getFullYear() + years, date.getMonth(), date.getDate());
};

const dateTimeEquals = (a: Date | string | null | undefined, b: Date | string | null | undefined): boolean => {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  const left = parseDate(a);
  const right = parseDate(b);
  if (left == null || right == null) return false;
  return left.getTime() === right.getTime();
};

type ShareStartInsuranceFields = Pick<CarOnboarding, 'hasInsuranceContract' | 'insurerContractStartedAt'>;

export const getEarliestShareStartDate = (onboarding: ShareStartInsuranceFields, today: Date = new Date()): Date => {
  if (!onboarding.hasInsuranceContract || onboarding.insurerContractStartedAt == null) {
    return startOfMonth(today);
  }

  const contractStart = parseDate(onboarding.insurerContractStartedAt);
  if (contractStart == null) {
    return startOfMonth(today);
  }

  const oneYearAgo = addCalendarYears(today, -1);
  const withinLastYear = contractStart.getTime() > oneYearAgo.getTime();
  const rawEarliest = withinLastYear ? addCalendarYears(contractStart, 1) : addCalendarMonths(today, 2);
  return ceilToFirstOfMonth(rawEarliest);
};

export const getLatestShareStartDate = (today: Date = new Date()): Date => {
  return startOfMonth(addCalendarMonths(today, 18));
};

export const isValidShareStartDate = (date: Date | string, onboarding: ShareStartInsuranceFields, today: Date = new Date()): boolean => {
  const parsed = parseDate(date);
  if (parsed == null || parsed.getDate() !== 1) return false;

  const earliest = getEarliestShareStartDate(onboarding, today);
  const latest = getLatestShareStartDate(today);
  const normalized = startOfMonth(parsed).getTime();
  return normalized >= earliest.getTime() && normalized <= latest.getTime();
};

export const isShareStartSectionComplete = (onboarding: Pick<CarOnboarding, 'shareStartDate' | 'carName'>): boolean => {
  return (
    onboarding.shareStartDate != null &&
    isNonEmptyString(onboarding.carName) &&
    carOnboardingCarNameSchema.safeParse(onboarding.carName).success
  );
};

export const shouldClearShareStartOnInsurerChange = (
  previous: Pick<CarOnboarding, 'hasInsuranceContract' | 'insurerContractStartedAt' | 'shareStartDate'>,
  next: ShareStartInsuranceFields,
  today: Date = new Date(),
): boolean => {
  if (previous.shareStartDate == null) return false;

  const insuranceChanged =
    previous.hasInsuranceContract !== next.hasInsuranceContract ||
    !dateTimeEquals(previous.insurerContractStartedAt, next.insurerContractStartedAt);

  if (insuranceChanged) return true;

  return !isValidShareStartDate(previous.shareStartDate, next, today);
};

export const canUpdateInsurer = (onboarding: Pick<CarOnboarding, 'insurerStatus' | 'isPurchased' | 'hasInsuranceContract'>): boolean => {
  if (onboarding.insurerStatus === CarOnboardingInsurerStatus.TODO) {
    return true;
  }

  return onboarding.isPurchased && !onboarding.hasInsuranceContract && onboarding.insurerStatus === CarOnboardingInsurerStatus.NOT_APPLICABLE;
};

export const applyInsurerStatus = (onboarding: CarOnboarding): CarOnboarding => {
  const withPriceIncrease =
    onboarding.hasInsuranceContract && isInsurerContractStartedWithinLastYear(onboarding.insurerContractStartedAt)
      ? onboarding.insurerAnnouncedPriceIncrease
      : false;
  const normalized = { ...onboarding, insurerAnnouncedPriceIncrease: withPriceIncrease };

  if (!normalized.hasInsuranceContract) {
    if (normalized.isPurchased && normalized.insurerStatus === CarOnboardingInsurerStatus.TODO) {
      return {
        ...normalized,
        insurerStatus: CarOnboardingInsurerStatus.TODO,
      };
    }

    return {
      ...normalized,
      insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
      insurer: null,
      insurerContractStartedAt: null,
    };
  }

  if (normalized.insurer != null && normalized.insurerContractStartedAt != null) {
    return {
      ...normalized,
      insurerStatus: CarOnboardingInsurerStatus.READY,
    };
  }

  return {
    ...normalized,
    insurerStatus: CarOnboardingInsurerStatus.TODO,
  };
};

export const isRoadAssistancePlanSectionComplete = (onboarding: Pick<CarOnboarding, 'roadAssistancePlanStatus'>): boolean => {
  return onboarding.roadAssistancePlanStatus !== CarOnboardingRoadAssistancePlanStatus.TODO;
};

export const isCarStickerSectionComplete = (_onboarding: Pick<CarOnboarding, 'carStickers'>): boolean => {
  return true;
};

export const isPreparationConfirmed = (onboarding: Pick<CarOnboarding, 'preparationConfirmedAt'>): boolean => {
  return onboarding.preparationConfirmedAt != null;
};

export const isPreparationConfirmable = (
  onboarding: Pick<
    CarOnboarding,
    | 'owner'
    | 'infoSessionStatus'
    | 'street'
    | 'town'
    | 'phone'
    | 'brand'
    | 'fuelType'
    | 'carType'
    | 'carTypeOther'
    | 'isPurchased'
    | 'isNewCar'
    | 'firstRegisteredAt'
    | 'registrationCertificateFront'
    | 'registrationCertificateBack'
    | 'inspectionCertificate'
    | 'pinkForm'
    | 'carValue'
    | 'carValueStatus'
    | 'insurerStatus'
    | 'roadAssistancePlanStatus'
    | 'carStickers'
    | 'shareStartDate'
    | 'carName'
    | 'preparationConfirmedAt'
    | 'statusInPreparation'
  >,
): boolean => {
  if (onboarding.statusInPreparation === CarOnboardingInPreparationStatus.LOCKED) return false;
  if (isPreparationConfirmed(onboarding)) return false;

  const carValueComplete = onboarding.isPurchased || onboarding.carValueStatus === CarOnboardingCarValueStatus.RESOLVED;

  return (
    isPlayConnectorSectionComplete(onboarding) &&
    isInfoSessionEnrolled(onboarding) &&
    isUserInfoSectionComplete(onboarding) &&
    isCarInfoSectionComplete(onboarding) &&
    isInsurerSectionComplete(onboarding) &&
    isRoadAssistancePlanSectionComplete(onboarding) &&
    carValueComplete &&
    isCarStickerSectionComplete(onboarding) &&
    isShareStartSectionComplete(onboarding)
  );
};

export const applyRoadAssistancePlanStatus = (onboarding: CarOnboarding): CarOnboarding => {
  if (!onboarding.hasExistingRoadAssistancePlan) {
    onboarding = {
      ...onboarding,
      existingRoadAssistancePlanEndDate: null,
    };
  }

  const hasRequiredExistingFields = !onboarding.hasExistingRoadAssistancePlan || onboarding.existingRoadAssistancePlanEndDate != null;
  const hasDesiredPlan = onboarding.roadAssistancePlan != null;

  if (hasRequiredExistingFields && hasDesiredPlan) {
    return {
      ...onboarding,
      roadAssistancePlanStatus: CarOnboardingRoadAssistancePlanStatus.READY,
    };
  }

  return {
    ...onboarding,
    roadAssistancePlanStatus: CarOnboardingRoadAssistancePlanStatus.TODO,
  };
};
