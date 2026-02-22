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

// Step codes — used as translation keys (simulation.step.*) and for unit testing
export enum SimulationStepCode {
  MILEAGE_LIMIT = 'mileage_limit',
  CAR_LIMIT = 'car_limit',
  PRICE_ESTIMATED = 'price_estimated',
  PRICE_ESTIMATION_FAILED = 'price_estimation_failed',
  CAR_INFO_ESTIMATED = 'car_info_estimated',
  CAR_INFO_ESTIMATION_FAILED = 'car_info_estimation_failed',
  CAR_TAX_ESTIMATED = 'car_tax_estimated',
  CAR_TAX_ESTIMATED_ELECTRIC = 'car_tax_estimated_electric',
  CAR_TAX_CO2_ADJUSTMENT = 'car_tax_co2_adjustment',
  CAR_TAX_EURO_NORM_ADJUSTMENT = 'car_tax_euro_norm_adjustment',
  CAR_TAX_FAILED = 'car_tax_failed',
  CAR_INSURANCE_ESTIMATED = 'car_insurance_estimated',
  CAR_INSURANCE_FAILED = 'car_insurance_failed',
  YEARLY_MILEAGE_ESTIMATE = 'yearly_mileage_estimate',
  KM_RATE_ESTIMATED = 'km_rate_estimated',
  PAYBACK_MILEAGE = 'payback_mileage',
  INFO_MESSAGE = 'info_message',
  ERROR_MESSAGE = 'error_message',
  ERROR_DURING_STEP = 'error_during_step',
}

// Step icon — how the step is displayed (e.g. Check / Cross / Info)
export enum SimulationStepIcon {
  OK = 'ok',
  NOT_OK = 'not_ok',
  INFO = 'info',
  WARNING = 'warning',
}

// Phase keys for error reporting (translation keys under simulation.phase.*)
export enum SimulationPhase {
  INITIAL_CHECKS = 'simulation.phase.initial_checks',
  PRICE_ESTIMATION = 'simulation.phase.price_estimation',
  CAR_INFO = 'simulation.phase.car_info',
  CAR_TAX = 'simulation.phase.car_tax',
  CAR_INSURANCE = 'simulation.phase.car_insurance',
  KM_RATE = 'simulation.phase.km_rate',
  UNKNOWN = 'simulation.phase.unknown',
}

export const simulationStepIconSchema = z.enum(SimulationStepIcon);

export const simulationStepSchema = z.object({
  status: simulationStepIconSchema,
  message: z.string(),
});

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
    mileage: z.number().int().min(0),
    ownerKmPerYear: z.number().int().min(0),
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
    mileage: z.number().int().min(0),
    ownerKmPerYear: z.number().int().min(0),
    seats: z.number().int().min(1),
    firstRegisteredAt: z.date(),
    isVan: z.boolean(),
    resultCode: z.enum(SimulationResultCode),
    estimatedPrice: z.number().nullable(),
    cylinderCc: z.number().int().nullable().default(null),
    co2Emission: z.number().int().nullable().default(null),
    ecoscore: z.number().int().min(0).max(100).nullable().default(null),
    euroNormCode: z.string().nullable().default(null),
    consumption: z.number().nullable().default(null),
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

export interface SimulationCarInfo {
  cylinderCc: number;
  co2Emission: number;
  ecoscore: number;
  euroNormCode: string | null;
  consumption: number;
}

export interface SimulationResultBuilder {
  steps: SimulationStep[];
}

export interface SimulationEngineResult extends SimulationResultBuilder {
  resultCode: SimulationResultCode;
  carInfo: SimulationCarInfo | null;
  currentStep: string | null;
}
