import * as z from 'zod';

import { idNameSchema, userReferenceSchema } from '@/domain/id-name.model';

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
    insurer: idNameSchema.nullable().default(null),
    insurerStatus: z.enum(CarOnboardingInsurerStatus).default(CarOnboardingInsurerStatus.TODO),
    insurerContractStartedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type CarOnboardingCarInfo = z.infer<typeof carOnboardingCarInfoSchema>;
export type CarOnboardingUserInfo = z.infer<typeof carOnboardingUserInfoSchema>;
export type CarOnboardingCarValue = z.infer<typeof carOnboardingCarValueSchema>;
export type CarOnboardingInsurer = z.infer<typeof carOnboardingInsurerSchema>;

export const carOnboardingSchema = carOnboardingCarInfoSchema
  .merge(carOnboardingUserInfoSchema)
  .merge(carOnboardingCarValueSchema)
  .merge(carOnboardingInsurerSchema)
  .extend({
    id: z.uuid().nullable(),
    carTypeOther: z.string().nullable().default(null),
    isPurchased: z.boolean().default(false),
    purchasePrice: z.number().min(0).default(0),
    depreciationCostKm: z.number().min(0).default(0),
    isNewCar: z.boolean().default(false),
    mileage: z.number().int().min(0).default(0),
    firstRegisteredAt: z.coerce.date().nullable().default(null),
    seats: z.number().int().min(0).default(0),
    isVan: z.boolean().default(false),
    owner: carOnboardingOwnerSchema.nullable().default(null),
    simulation: idNameSchema.nullable().default(null),
    statusInPreparation: z.enum(CarOnboardingInPreparationStatus).default(CarOnboardingInPreparationStatus.OPEN),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type CarOnboarding = z.infer<typeof carOnboardingSchema>;

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
  .extend({ town: idNameSchema })
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

export const carOnboardingInsurerInputSchema = carOnboardingInsurerSchema
  .pick({ insurer: true, insurerContractStartedAt: true })
  .extend({
    insurer: idNameSchema,
    insurerContractStartedAt: z.coerce.date(),
  })
  .strict();

export type CarOnboardingInsurerInput = z.infer<typeof carOnboardingInsurerInputSchema>;

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
    isPurchased: simulation.isNewCar,
    purchasePrice: simulation.purchasePrice ?? 0,
    carValue: simulation.resultEstimatedCarValue ?? 0,
    carValueCounterProposal: 0,
    carValueCounterProposalMessage: null,
    carValueStatus: CarOnboardingCarValueStatus.TODO,
    insurer: null,
    insurerContractStartedAt: null,
    insurerStatus: CarOnboardingInsurerStatus.TODO,
    depreciationCostKm: simulation.resultDepreciationCostKm ?? 0,
    isNewCar: simulation.isNewCar,
    mileage: simulation.mileage,
    firstRegisteredAt: simulation.firstRegisteredAt,
    seats: simulation.seats,
    isVan: simulation.isVan,
    owner: { id: options.ownerId },
    simulation: simulation.id != null ? { id: simulation.id } : null,
    statusInPreparation: CarOnboardingInPreparationStatus.OPEN,
  };
};

const isNonEmptyString = (value: string | null | undefined): boolean => {
  return value != null && value.trim().length > 0;
};

export const isCarInfoSectionComplete = (onboarding: Pick<CarOnboarding, 'brand' | 'fuelType' | 'carType' | 'carTypeOther'>): boolean => {
  return onboarding.brand != null && onboarding.fuelType != null && (onboarding.carType != null || isNonEmptyString(onboarding.carTypeOther));
};

export const isCarValueProposedToOwner = (onboarding: Pick<CarOnboarding, 'carValueStatus' | 'carValue'>): boolean => {
  if (onboarding.carValueStatus === CarOnboardingCarValueStatus.PROPOSAL) return true;
  return onboarding.carValueStatus === CarOnboardingCarValueStatus.TODO && onboarding.carValue > 0;
};

export const isUserInfoSectionComplete = (onboarding: CarOnboardingUserInfo): boolean => {
  return isNonEmptyString(onboarding.street) && onboarding.town != null && isNonEmptyString(onboarding.phone);
};

export const isPlayConnectorSectionComplete = (onboarding: Pick<CarOnboarding, 'owner'>): boolean => {
  return onboarding.owner?.hasPlayConnector === true;
};

export const isInsurerSectionComplete = (onboarding: Pick<CarOnboarding, 'insurerStatus'>): boolean => {
  return onboarding.insurerStatus !== CarOnboardingInsurerStatus.TODO;
};

export const applyInsurerStatus = (onboarding: CarOnboarding): CarOnboarding => {
  if (onboarding.isPurchased) {
    return {
      ...onboarding,
      insurerStatus: CarOnboardingInsurerStatus.NOT_APPLICABLE,
      insurer: null,
      insurerContractStartedAt: null,
    };
  }

  if (onboarding.insurer != null && onboarding.insurerContractStartedAt != null) {
    return {
      ...onboarding,
      insurerStatus: CarOnboardingInsurerStatus.READY,
    };
  }

  return {
    ...onboarding,
    insurerStatus: CarOnboardingInsurerStatus.TODO,
  };
};
