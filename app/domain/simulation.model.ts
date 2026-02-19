import * as z from 'zod';

import { idNameSchema } from '@/domain/id-name.model';

// Result codes (required on simulation)
export enum SimulationResultCode {
  NOT_OK = 'notOk',
  CATEGORY_A = 'categoryA',
  CATEGORY_B = 'categoryB',
  HIGHER_RATE = 'higherRate',
  MANUAL_REVIEW = 'manualReview',
}

// Step codes — used as translation keys and for unit testing
export enum SimulationStepCode {
  KM_LIMIT = 'km_limit',
  CAR_LIMIT = 'car_limit',
  PRICE_ESTIMATED = 'price_estimated',
  PRICE_ESTIMATION_FAILED = 'price_estimation_failed',
  CAR_INFO_ESTIMATED = 'car_info_estimated',
  CAR_INFO_ESTIMATION_FAILED = 'car_info_estimation_failed',
  YEARLY_KM_ESTIMATE = 'yearly_km_estimate',
  PAYBACK_KM = 'payback_km',
}

// Step status — how the step is displayed (e.g. Check / Cross / Info)
export enum SimulationStepStatus {
  OK = 'ok',
  NOT_OK = 'not_ok',
  INFO = 'info',
  WARNING = 'warning',
}

export const simulationStepStatusSchema = z.enum(SimulationStepStatus);

export const simulationStepSchema = z
  .object({
    code: z.enum(SimulationStepCode),
    status: simulationStepStatusSchema,
    message: z.string(),
  })
  .strict();

export type SimulationStep = z.infer<typeof simulationStepSchema>;

// Re-export for consumers that need entity-specific type names
export type SimulationBrand = z.infer<typeof idNameSchema>;
export type SimulationFuelType = z.infer<typeof idNameSchema>;
export type SimulationCarType = z.infer<typeof idNameSchema>;
export type SimulationTown = z.infer<typeof idNameSchema>;

// Run input — used only for POST run simulation (request body). Uses IdName for relations.
export const simulationRunInputSchema = z
  .object({
    town: idNameSchema,
    brand: idNameSchema,
    fuelType: idNameSchema,
    carType: idNameSchema.nullable().default(null),
    carTypeOther: z.string().nullable().default(null),
    km: z.number().int().min(0),
    seats: z.number().int().min(1),
    firstRegisteredAt: z.coerce.date(),
    isVan: z.coerce.boolean().default(false),
  })
  .strict();

/** Run input with business rule: carTypeOther required when car type is Other. Use for parsing request body. */
export const simulationRunInputParseSchema = simulationRunInputSchema.refine(
  (data) => data.carType != null || (data.carTypeOther != null && data.carTypeOther.trim().length > 0),
  { message: 'carTypeOther is required when car type is Other', path: ['carTypeOther'] },
);

export type SimulationRunInput = z.infer<typeof simulationRunInputSchema>;

// Simulation entity: flat IDs for storage, optional IdName for API display
export const simulationSchema = z
  .object({
    id: z.uuid().nullable(),
    townId: z.uuid(),
    brandId: z.uuid(),
    fuelTypeId: z.uuid(),
    carTypeId: z.uuid().nullable(),
    carTypeOther: z.string().nullable(),
    km: z.number().int().min(0),
    seats: z.number().int().min(1),
    firstRegisteredAt: z.date(),
    isVan: z.boolean(),
    resultCode: z.enum(SimulationResultCode),
    estimatedPrice: z.number().nullable(),
    cylinderCc: z.number().int().nullable().default(null),
    co2Emission: z.number().int().nullable().default(null),
    ecoscore: z.number().int().min(0).max(100).nullable().default(null),
    euroNormCode: z.string().nullable().default(null),
    steps: z.array(simulationStepSchema).default([]),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
    town: idNameSchema.optional(),
    brand: idNameSchema.optional(),
    fuelType: idNameSchema.optional(),
    carType: idNameSchema.nullable().optional(),
  })
  .strict();

export type Simulation = z.infer<typeof simulationSchema>;

// Price range returned by car value estimator (integrations)
export interface PriceRange {
  price: number;
  min: number;
  max: number;
}
