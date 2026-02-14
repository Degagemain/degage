import * as z from 'zod';

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
  YEARLY_KM_ESTIMATE = 'yearly_km_estimate',
  PAYBACK_KM = 'payback_km',
}

// Step status — how the step is displayed (e.g. Check / Cross / Info)
export enum SimulationStepStatus {
  OK = 'ok',
  NOT_OK = 'not_ok',
  INFO = 'info',
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

// Run input — used only for POST run simulation (request body)
export const simulationRunInputSchema = z
  .object({
    brandId: z.uuid(),
    fuelTypeId: z.uuid(),
    carTypeId: z.uuid().nullable().default(null),
    carTypeOther: z.string().nullable().default(null),
    km: z.number().int().min(0),
    firstRegisteredAt: z.coerce.date(),
    isVan: z.coerce.boolean().default(false),
  })
  .strict();

/** Run input with business rule: carTypeOther required when car type is Other. Use for parsing request body. */
export const simulationRunInputParseSchema = simulationRunInputSchema.refine(
  (data) => data.carTypeId != null || (data.carTypeOther != null && data.carTypeOther.trim().length > 0),
  { message: 'carTypeOther is required when car type is Other', path: ['carTypeOther'] },
);

export type SimulationRunInput = z.infer<typeof simulationRunInputSchema>;

// Simulation extends run input with id, result fields, and timestamps
export const simulationSchema = simulationRunInputSchema
  .extend({
    id: z.uuid().nullable(),
    firstRegisteredAt: z.date(), // override: storage uses Date, input uses coerce.date
    resultCode: z.enum(SimulationResultCode),
    estimatedPrice: z.number().nullable(),
    steps: z.array(simulationStepSchema).default([]),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type Simulation = z.infer<typeof simulationSchema>;

// Price range returned by car value estimator (integrations)
export interface PriceRange {
  min: number;
  max: number;
}

// Engine constants (used by rules and tests)
export const SIMULATION_MAX_KM = 250_000;
export const SIMULATION_MAX_AGE_YEARS = 15;
