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
  ESTIMATED_TOTAL_YEARLY_MILEAGE = 'estimated_total_yearly_mileage',
  FIXED_YEAR_COST = 'fixed_year_cost',
  EXTRA_BONUS_POINTS = 'extra_bonus_points',
  BUILD_YEAR_BONUS = 'build_year_bonus',
  CAR_INFO_ESTIMATED = 'car_info_estimated',
  CAR_INFO_ESTIMATION_FAILED = 'car_info_estimation_failed',
  CAR_INSURANCE_ESTIMATED = 'car_insurance_estimated',
  CAR_INSURANCE_FAILED = 'car_insurance_failed',
  CAR_LIMIT = 'car_limit',
  CAR_TAX_CO2_ADJUSTMENT = 'car_tax_co2_adjustment',
  CAR_TAX_ESTIMATED = 'car_tax_estimated',
  CAR_TAX_ESTIMATED_ELECTRIC = 'car_tax_estimated_electric',
  CAR_TAX_EURO_NORM_ADJUSTMENT = 'car_tax_euro_norm_adjustment',
  CAR_TAX_FAILED = 'car_tax_failed',
  DEPRECIATION_COST_PER_KM = 'depreciation_cost_per_km',
  ECO_SCORE_BONUS = 'eco_score_bonus',
  ERROR_DURING_STEP = 'error_during_step',
  ERROR_MESSAGE = 'error_message',
  FUEL_COST_PER_KM = 'fuel_cost_per_km',
  INFO_MESSAGE = 'info_message',
  KM_RATE_ESTIMATED = 'km_rate_estimated',
  MILEAGE_BONUS = 'mileage_bonus',
  MILEAGE_LIMIT = 'mileage_limit',
  PAYBACK_MILEAGE = 'payback_mileage',
  PRICE_CRITERIA_NOT_MET = 'price_criteria_not_met',
  CAR_PRICE_MANUAL_REVIEW_WOULD_ACCEPT = 'car_price_manual_review_would_accept',
  PRICE_ESTIMATED = 'price_estimated',
  PRICE_ESTIMATION_FAILED = 'price_estimation_failed',
  QUALITY_CRITERIA_NOT_MET = 'quality_criteria_not_met',
  YEARLY_MILEAGE_ESTIMATE = 'yearly_mileage_estimate',
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
    isNewCar: z.coerce.boolean().default(false),
    purchasePrice: z.number().min(0).nullable().default(null),
    backtestYear: z.number().int().nullable().default(null),
  })
  .strict();

/** Run input with business rule: carTypeOther required when car type is Other. Use for parsing request body. */
export const simulationRunInputParseSchema = simulationRunInputSchema.refine(
  (data) => data.carType != null || (data.carTypeOther != null && data.carTypeOther.trim().length > 0),
  { message: 'carTypeOther is required when car type is Other', path: ['carTypeOther'] },
);

export type SimulationRunInput = z.infer<typeof simulationRunInputSchema>;

export const simulationSchema = z
  .object({
    id: z.uuid().nullable(),
    town: idNameSchema,
    brand: idNameSchema,
    fuelType: idNameSchema,
    carType: idNameSchema.nullable(),
    carTypeOther: z.string().nullable(),
    mileage: z.number().int().min(0),
    ownerKmPerYear: z.number().int().min(0),
    seats: z.number().int().min(1),
    firstRegisteredAt: z.date(),
    isVan: z.boolean(),
    isNewCar: z.boolean().default(false),
    purchasePrice: z.number().min(0).nullable().default(null),
    rejectionReason: z.string().nullable().default(null),
    resultCode: z.enum(SimulationResultCode),
    resultEuroNorm: z.string().nullable().default(null),
    resultEcoScore: z.number().int().nullable().default(null),
    resultConsumption: z.number().nullable().default(null),
    resultCc: z.number().int().nullable().default(null),
    resultCo2: z.number().int().nullable().default(null),
    resultInsuranceCostPerYear: z.number().nullable().default(null),
    resultTaxCostPerYear: z.number().nullable().default(null),
    resultInspectionCostPerYear: z.number().nullable().default(null),
    resultMaintenanceCostPerYear: z.number().nullable().default(null),
    resultBenchmarkMinKm: z.number().int().nullable().default(null),
    resultBenchmarkAvgKm: z.number().int().nullable().default(null),
    resultBenchmarkMaxKm: z.number().int().nullable().default(null),
    resultRoundedKmCost: z.number().nullable().default(null),
    resultDepreciationCostKm: z.number().nullable().default(null),
    resultEstimatedCarValue: z.number().nullable().default(null),
    error: z.string().nullable().default(null),
    duration: z.number().int().min(0).default(45),
    steps: z.array(simulationStepSchema).default([]),
    email: z.string().email().nullable().default(null),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type Simulation = z.infer<typeof simulationSchema>;

export const simulationUpdateBodySchema = z
  .object({
    id: z.uuid(),
    email: z
      .union([z.string().email(), z.literal('')])
      .nullable()
      .transform((v) => (v === '' || v == null ? null : v)),
  })
  .strict();

export type SimulationUpdateBody = z.infer<typeof simulationUpdateBodySchema>;

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
  rejectionReason?: string | null;
  resultEuroNorm?: string | null;
  resultEcoScore?: number | null;
  resultConsumption?: number | null;
  resultCc?: number | null;
  resultCo2?: number | null;
  resultInsuranceCostPerYear?: number | null;
  resultTaxCostPerYear?: number | null;
  resultInspectionCostPerYear?: number | null;
  resultMaintenanceCostPerYear?: number | null;
  resultBenchmarkMinKm?: number | null;
  resultBenchmarkAvgKm?: number | null;
  resultBenchmarkMaxKm?: number | null;
  resultRoundedKmCost?: number | null;
  resultDepreciationCostKm?: number | null;
  resultEstimatedCarValue?: number | null;
  error?: string | null;
  duration?: number;

  /* Read-only, not stored in the database */
  estimate?: PriceRange;
}
