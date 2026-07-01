import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/car-price-estimate/car-price-estimator', () => ({
  carValueEstimator: vi.fn().mockResolvedValue({ price: 15_000, min: 12_000, max: 18_000 }),
}));

vi.mock('@/actions/simulation/car-info-estimator', () => ({
  carInfoEstimator: vi.fn().mockResolvedValue({ cylinderCc: 1498, co2Emission: 120, ecoscore: 72, euroNormCode: 'euro-6d', consumption: 6 }),
}));

vi.mock('@/actions/simulation/car-tax-calculator', () => ({
  calculateCarTax: vi.fn().mockImplementation(async (result: { steps: { push: (step: unknown) => void } }) => {
    result.steps.push({ status: 'info', message: 'simulation.step.car_tax_estimated' });
    return 250;
  }),
}));

vi.mock('@/i18n/get-message', () => ({
  getMessage: vi.fn((path: string) => Promise.resolve(path)),
}));

vi.mock('@/storage/town/town.read', () => ({
  dbTownRead: vi.fn().mockResolvedValue({ id: 'town-1', province: { id: 'province-1' }, hub: { id: 'hub-1' }, highDemand: false }),
}));

vi.mock('@/storage/hub/hub.read', () => ({
  dbHubRead: vi.fn().mockResolvedValue({
    id: 'hub-1',
    name: 'hub',
    isDefault: true,
    simMaxAge: 15,
    simMaxKm: 250_000,
    simMinEuroNormGroupDiesel: 5,
    simDepreciationKm: 200_000,
    simDepreciationKmElectric: 300_000,
    simInspectionCostPerYear: 43,
    simMaintenanceCostPerYear: 950,
    minSharedKm: 3_000,
    avgSharedKm: 5_000,
    maxSharedKm: 7_000,
    simMaxPrice: null,
    simAcceptedPriceCategoryA: 0.38,
    simAcceptedPriceCategoryB: 0.46,
    simAcceptedDepreciationCostKm: 0.32,
    simAcceptedElectricDepreciationCostKm: 0.33,
    simMinDepreciationCostKm: 0.05,
    simMinEcoScoreForBonus: 60,
    simMaxKmForBonus: 140_000,
    simMaxAgeForBonus: 7,
    createdAt: null,
    updatedAt: null,
  }),
}));

vi.mock('@/storage/fuel-type/fuel-type.read', () => ({
  dbFuelTypeRead: vi.fn().mockResolvedValue({ id: 'fuel-1', code: 'petrol', name: 'Petrol', pricePer: 1.5 }),
}));

vi.mock('@/storage/province/province.read', () => ({
  dbProvinceRead: vi.fn().mockResolvedValue({ fiscalRegion: { id: 'fiscal-region-1' } }),
}));

vi.mock('@/storage/fiscal-region/fiscal-region.read', () => ({
  dbFiscalRegionRead: vi.fn().mockResolvedValue({ id: 'fiscal-region-1', isDefault: true }),
}));

vi.mock('@/storage/euro-norm/euro-norm.read', () => ({
  dbEuroNormFindByCode: vi.fn().mockResolvedValue({ id: 'euro-norm-1', group: 6 }),
}));

vi.mock('@/storage/car-type/car-type.read', () => ({
  dbCarTypeRead: vi.fn().mockResolvedValue({ id: 'car-type-1', ecoscore: 72 }),
}));

vi.mock('@/actions/simulation/car-insurance-calculator', () => ({
  calculateCarInsurance: vi.fn().mockImplementation(async (result: { steps: { push: (step: unknown) => void } }) => {
    result.steps.push({ status: 'info', message: 'simulation.step.car_insurance_estimated' });
    return 500;
  }),
}));

import { carValueEstimator } from '@/actions/car-price-estimate/car-price-estimator';
import { InvalidCarPriceEstimateError } from '@/actions/car-price-estimate/invalid-car-price-estimate.error';
import { carInfoEstimator } from '@/actions/simulation/car-info-estimator';
import { passesAgeRule, passesMileageRule, runSimulationEngine } from '@/actions/simulation/engine';
import { dbCarTypeRead } from '@/storage/car-type/car-type.read';
import { hubSchema } from '@/domain/hub.model';
import { SimulationStepIcon } from '@/domain/simulation.model';
import { dbHubRead } from '@/storage/hub/hub.read';
import { simulationRunInput } from '../../builders/simulation.builder';

afterEach(() => {
  vi.clearAllMocks();
});

const DEFAULT_MAX_MILEAGE = 250_000;

describe('applyMileageRule', () => {
  it('adds ok step and returns true when mileage is under limit', async () => {
    const result = { steps: [] as { status: string; message: string }[] };
    const passed = await passesMileageRule(result, 100_000, DEFAULT_MAX_MILEAGE);
    expect(passed).toBe(true);
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].status).toBe(SimulationStepIcon.OK);
  });

  it('adds not_ok step and returns false when mileage is over 250_000', async () => {
    const result = { steps: [] as { status: string; message: string }[] };
    const passed = await passesMileageRule(result, 300_000, DEFAULT_MAX_MILEAGE);
    expect(passed).toBe(false);
    expect(result.steps[0].status).toBe(SimulationStepIcon.NOT_OK);
  });

  it('boundary: exactly 250_000 adds ok step and returns true', async () => {
    const result = { steps: [] as { status: string; message: string }[] };
    const passed = await passesMileageRule(result, 250_000, DEFAULT_MAX_MILEAGE);
    expect(passed).toBe(true);
    expect(result.steps[0].status).toBe(SimulationStepIcon.OK);
  });
});

const DEFAULT_MAX_AGE_YEARS = 15;

describe('applyAgeRule', () => {
  it('adds ok step and returns true when car is not older than 15 years', async () => {
    const result = { steps: [] as { status: string; message: string }[] };
    const recentDate = new Date();
    recentDate.setFullYear(recentDate.getFullYear() - 5);
    const passed = await passesAgeRule(result, recentDate, DEFAULT_MAX_AGE_YEARS);
    expect(passed).toBe(true);
    expect(result.steps[0].status).toBe(SimulationStepIcon.OK);
  });

  it('adds not_ok step and returns false when car is older than 15 years', async () => {
    const result = { steps: [] as { status: string; message: string }[] };
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 20);
    const passed = await passesAgeRule(result, oldDate, DEFAULT_MAX_AGE_YEARS);
    expect(passed).toBe(false);
    expect(result.steps[0].status).toBe(SimulationStepIcon.NOT_OK);
  });
});

describe('runSimulationEngine', () => {
  it('rejects when mileage over limit and returns steps with not_ok status', async () => {
    const input = simulationRunInput({ mileage: 300_000 });
    const result = await runSimulationEngine(input);
    expect(['notOk', 'manualReview']).toContain(result.resultCode);
    expect(result.steps.length).toBeGreaterThanOrEqual(1);
    expect(result.steps[0].status).toBe(SimulationStepIcon.NOT_OK);
    expect(carValueEstimator).not.toHaveBeenCalled();
  });

  it('rejects new car when mileage over limit', async () => {
    const input = simulationRunInput({
      isPurchased: true,
      isNewCar: false,
      purchasePrice: 25_000,
      mileage: 300_000,
      firstRegisteredAt: new Date(),
    });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('notOk');
    expect(result.steps[0].status).toBe(SimulationStepIcon.NOT_OK);
    expect(carValueEstimator).not.toHaveBeenCalled();
  });

  it('uses mileage for new car depreciation km runway', async () => {
    const lowMileageInput = simulationRunInput({
      isPurchased: true,
      isNewCar: false,
      purchasePrice: 25_000,
      mileage: 0,
      ownerKmPerYear: 10_000,
      firstRegisteredAt: new Date(),
    });
    const highMileageInput = simulationRunInput({
      ...lowMileageInput,
      mileage: 100_000,
    });
    const lowResult = await runSimulationEngine(lowMileageInput);
    const highResult = await runSimulationEngine(highMileageInput);
    expect(highResult.resultDepreciationCostKm).toBeGreaterThan(lowResult.resultDepreciationCostKm ?? 0);
    expect(carValueEstimator).not.toHaveBeenCalled();
  });

  it('uses current year for car info when purchased car is new', async () => {
    vi.mocked(carInfoEstimator).mockClear();
    const currentYear = new Date().getFullYear();
    await runSimulationEngine(
      simulationRunInput({
        isPurchased: true,
        isNewCar: true,
        purchasePrice: 25_000,
        mileage: 0,
        firstRegisteredAt: new Date(),
      }),
    );
    expect(carInfoEstimator).toHaveBeenCalledWith(expect.any(String), expect.anything(), expect.anything(), null, currentYear);
  });

  it('uses first registration year for car info when purchased car is used', async () => {
    vi.mocked(carInfoEstimator).mockClear();
    await runSimulationEngine(
      simulationRunInput({
        isPurchased: true,
        isNewCar: false,
        purchasePrice: 25_000,
        mileage: 50_000,
        firstRegisteredAt: new Date('2018-03-15'),
      }),
    );
    expect(carInfoEstimator).toHaveBeenCalledWith(expect.any(String), expect.anything(), expect.anything(), null, 2018);
  });

  it('rejects when car too old and returns steps with not_ok on second step', async () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 20);
    const input = simulationRunInput({ firstRegisteredAt: oldDate, mileage: 50_000 });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('notOk');
    expect(result.steps).toHaveLength(2);
    expect(result.steps[1].status).toBe(SimulationStepIcon.NOT_OK);
    expect(carValueEstimator).not.toHaveBeenCalled();
  });

  it('returns manualReview when value exceeds simMaxPrice but rules would accept (van → category B)', async () => {
    vi.mocked(dbHubRead).mockResolvedValueOnce(
      hubSchema.parse({
        id: '550e8400-e29b-41d4-a716-4466554400aa',
        name: 'hub',
        isDefault: true,
        simMaxAge: 15,
        simMaxKm: 250_000,
        simMinEuroNormGroupDiesel: 5,
        simDepreciationKm: 200_000,
        simDepreciationKmElectric: 300_000,
        simInspectionCostPerYear: 43,
        simMaintenanceCostPerYear: 950,
        minSharedKm: 3_000,
        avgSharedKm: 5_000,
        maxSharedKm: 7_000,
        simMaxPrice: 10_000,
        simAcceptedPriceCategoryA: 0.38,
        simAcceptedPriceCategoryB: 0.46,
        simAcceptedDepreciationCostKm: 0.32,
        simAcceptedElectricDepreciationCostKm: 0.33,
        simMinEcoScoreForBonus: 60,
        simMaxKmForBonus: 140_000,
        simMaxAgeForBonus: 7,
        createdAt: null,
        updatedAt: null,
      }),
    );
    const input = simulationRunInput({
      mileage: 50_000,
      firstRegisteredAt: new Date('2020-01-01'),
      isVan: true,
    });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('manualReview');
    expect(result.rejectionReason).toBe('simulation.step.car_price_manual_review_would_accept');
    const lastInfo = result.steps.filter((s) => s.status === SimulationStepIcon.INFO).pop();
    expect(lastInfo?.message).toBe('simulation.step.car_price_manual_review_would_accept');
    expect(result.carInfo).toEqual({ cylinderCc: 1498, co2Emission: 120, ecoscore: 72, euroNormCode: 'euro-6d', consumption: 6 });
  });

  it('calls carValueEstimator and returns steps when rules pass', async () => {
    const input = simulationRunInput({ mileage: 50_000, firstRegisteredAt: new Date('2020-01-01') });
    const result = await runSimulationEngine(input);
    expect(['manualReview', 'categoryA', 'categoryB']).toContain(result.resultCode);
    expect(result.steps.length).toBeGreaterThanOrEqual(7);
    expect(result.steps[0].status).toBe(SimulationStepIcon.OK);
    expect(result.steps[1].status).toBe(SimulationStepIcon.OK);
    expect(result.steps[2].status).toBe(SimulationStepIcon.INFO);
    expect(result.carInfo).toEqual({ cylinderCc: 1498, co2Emission: 120, ecoscore: 72, euroNormCode: 'euro-6d', consumption: 6 });
    expect(typeof result.duration).toBe('number');
    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(result.resultMinSharedKm).toBe(3_000);
    expect(result.resultAvgSharedKm).toBe(5_000);
    expect(result.resultMaxSharedKm).toBe(7_000);
    expect(carValueEstimator).toHaveBeenCalledTimes(1);
    expect(carValueEstimator).toHaveBeenCalledWith(
      input.brand.id,
      expect.objectContaining({ id: 'fuel-1', code: 'petrol' }),
      input.carType?.id ?? null,
      input.carTypeOther,
      input.firstRegisteredAt,
      200_000,
      null,
    );
  });

  it('returns categoryB for vans when category A/B seat rules do not apply', async () => {
    vi.mocked(dbHubRead).mockResolvedValueOnce(
      hubSchema.parse({
        id: '550e8400-e29b-41d4-a716-4466554400ad',
        name: 'hub-van',
        isDefault: false,
        simMaxAge: 15,
        simMaxKm: 250_000,
        simMinEuroNormGroupDiesel: 5,
        simDepreciationKm: 200_000,
        simDepreciationKmElectric: 300_000,
        simInspectionCostPerYear: 43,
        simMaintenanceCostPerYear: 950,
        minSharedKm: 3_000,
        avgSharedKm: 5_000,
        maxSharedKm: 7_000,
        simMaxPrice: null,
        simAcceptedPriceCategoryA: 0.01,
        simAcceptedPriceCategoryB: 1,
        simAcceptedDepreciationCostKm: 1,
        simAcceptedElectricDepreciationCostKm: 1,
        simMinEcoScoreForBonus: 60,
        simMaxKmForBonus: 140_000,
        simMaxAgeForBonus: 7,
        createdAt: null,
        updatedAt: null,
      }),
    );
    const input = simulationRunInput({
      mileage: 50_000,
      firstRegisteredAt: new Date('2020-01-01'),
      isVan: true,
      seats: 5,
    });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('categoryB');
  });

  it('floors depreciation cost per km to hub minimum without changing estimated car value', async () => {
    vi.mocked(carValueEstimator).mockResolvedValueOnce({ price: 2_000, min: 1_500, max: 2_500 });
    vi.mocked(dbHubRead).mockResolvedValueOnce(
      hubSchema.parse({
        id: '550e8400-e29b-41d4-a716-4466554400b0',
        name: 'hub-min-depreciation',
        isDefault: false,
        simMaxAge: 15,
        simMaxKm: 250_000,
        simMinEuroNormGroupDiesel: 5,
        simDepreciationKm: 200_000,
        simDepreciationKmElectric: 300_000,
        simInspectionCostPerYear: 43,
        simMaintenanceCostPerYear: 950,
        minSharedKm: 3_000,
        avgSharedKm: 5_000,
        maxSharedKm: 7_000,
        simMaxPrice: null,
        simAcceptedPriceCategoryA: 0.55,
        simAcceptedPriceCategoryB: 0.55,
        simAcceptedDepreciationCostKm: 0.32,
        simAcceptedElectricDepreciationCostKm: 0.33,
        simMinDepreciationCostKm: 0.05,
        simMinEcoScoreForBonus: 60,
        simMaxKmForBonus: 140_000,
        simMaxAgeForBonus: 7,
        createdAt: null,
        updatedAt: null,
      }),
    );

    const result = await runSimulationEngine(
      simulationRunInput({ mileage: 100_000, ownerKmPerYear: 10_000, firstRegisteredAt: new Date('2020-01-01') }),
    );

    expect(result.resultEstimatedCarValue).toBe(1_750);
    expect(result.resultDepreciationCostKm).toBe(0.05);
  });

  it('recomputes km cost after adapting car value to depreciation criteria', async () => {
    vi.mocked(carValueEstimator).mockResolvedValueOnce({ price: 70_000, min: 60_000, max: 75_000 });
    vi.mocked(dbHubRead).mockResolvedValueOnce(
      hubSchema.parse({
        id: '550e8400-e29b-41d4-a716-4466554400ae',
        name: 'hub-adapt-value',
        isDefault: false,
        simMaxAge: 15,
        simMaxKm: 250_000,
        simMinEuroNormGroupDiesel: 5,
        simDepreciationKm: 200_000,
        simDepreciationKmElectric: 300_000,
        simInspectionCostPerYear: 43,
        simMaintenanceCostPerYear: 950,
        minSharedKm: 3_000,
        avgSharedKm: 5_000,
        maxSharedKm: 7_000,
        simMaxPrice: null,
        simAcceptedPriceCategoryA: 0.55,
        simAcceptedPriceCategoryB: 0.55,
        simAcceptedDepreciationCostKm: 0.32,
        simAcceptedElectricDepreciationCostKm: 0.33,
        simMinEcoScoreForBonus: 60,
        simMaxKmForBonus: 140_000,
        simMaxAgeForBonus: 7,
        createdAt: null,
        updatedAt: null,
      }),
    );

    const result = await runSimulationEngine(
      simulationRunInput({ mileage: 0, ownerKmPerYear: 10_000, firstRegisteredAt: new Date('2024-01-01') }),
    );

    expect(result.resultCode).toBe('categoryA');
    expect(result.resultEstimatedCarValue).toBe(64_000);
    expect(result.resultDepreciationCostKm).toBe(0.32);
    expect(result.resultRoundedKmCost).toBeCloseTo(0.5262, 4);
  });

  it('adds an explicit NOT_OK step when depreciation criteria are not met', async () => {
    vi.mocked(carValueEstimator).mockResolvedValueOnce({ price: 70_000, min: 60_000, max: 75_000 });
    vi.mocked(dbHubRead).mockResolvedValueOnce(
      hubSchema.parse({
        id: '550e8400-e29b-41d4-a716-4466554400af',
        name: 'hub-depreciation-fail',
        isDefault: false,
        simMaxAge: 15,
        simMaxKm: 250_000,
        simMinEuroNormGroupDiesel: 5,
        simDepreciationKm: 200_000,
        simDepreciationKmElectric: 300_000,
        simInspectionCostPerYear: 43,
        simMaintenanceCostPerYear: 950,
        minSharedKm: 3_000,
        avgSharedKm: 5_000,
        maxSharedKm: 7_000,
        simMaxPrice: null,
        simAcceptedPriceCategoryA: 0.55,
        simAcceptedPriceCategoryB: 0.55,
        simAcceptedDepreciationCostKm: 0.1,
        simAcceptedElectricDepreciationCostKm: 0.1,
        simMinEcoScoreForBonus: 60,
        simMaxKmForBonus: 140_000,
        simMaxAgeForBonus: 7,
        createdAt: null,
        updatedAt: null,
      }),
    );

    const result = await runSimulationEngine(
      simulationRunInput({ mileage: 0, ownerKmPerYear: 10_000, firstRegisteredAt: new Date('2024-01-01') }),
    );

    expect(result.resultCode).toBe('notOk');
    expect(result.rejectionReason).toBe('simulation.step.price_criteria_not_met');
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.status).toBe(SimulationStepIcon.NOT_OK);
    expect(lastStep.message).toBe('simulation.step.price_criteria_not_met');
  });

  it('returns manualReview with price_estimation_failed when estimator returns invalid prices', async () => {
    vi.mocked(carValueEstimator).mockRejectedValueOnce(new InvalidCarPriceEstimateError('non-positive price (0)'));
    const input = simulationRunInput({ mileage: 50_000, firstRegisteredAt: new Date('2020-01-01') });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('manualReview');
    expect(result.rejectionReason).toBe('simulation.step.price_estimation_failed');
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.status).toBe(SimulationStepIcon.NOT_OK);
    expect(lastStep.message).toBe('simulation.step.price_estimation_failed');
    expect(carInfoEstimator).not.toHaveBeenCalled();
  });

  it('returns manualReview when mileage depreciation drives estimated value to zero', async () => {
    vi.mocked(carValueEstimator).mockResolvedValueOnce({ price: 10_000, min: 0, max: 15_000 });
    const input = simulationRunInput({ mileage: 200_000, firstRegisteredAt: new Date('2020-01-01') });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('manualReview');
    expect(result.rejectionReason).toBe('simulation.step.price_estimation_failed');
    expect(carInfoEstimator).not.toHaveBeenCalled();
  });

  it('on unexpected error adds generic error step with current phase and returns manualReview', async () => {
    vi.mocked(carValueEstimator).mockRejectedValueOnce(new Error('Network error'));
    const input = simulationRunInput({ mileage: 50_000, firstRegisteredAt: new Date('2020-01-01') });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('manualReview');
    expect(result.steps.length).toBeGreaterThanOrEqual(3);
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.status).toBe(SimulationStepIcon.NOT_OK);
    expect(lastStep.message).toBe('simulation.step.error_during_step');
    expect(typeof result.duration).toBe('number');
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it('adds an explicit NOT_OK step when quality criteria are not met', async () => {
    vi.mocked(dbCarTypeRead).mockResolvedValueOnce({ id: 'car-type-1', ecoscore: 40 } as any);
    vi.mocked(dbHubRead).mockResolvedValueOnce(
      hubSchema.parse({
        id: '550e8400-e29b-41d4-a716-4466554400ab',
        name: 'hub-quality-fail',
        isDefault: true,
        simMaxAge: 15,
        simMaxKm: 250_000,
        simMinEuroNormGroupDiesel: 5,
        simDepreciationKm: 200_000,
        simDepreciationKmElectric: 300_000,
        simInspectionCostPerYear: 43,
        simMaintenanceCostPerYear: 950,
        minSharedKm: 3_000,
        avgSharedKm: 5_000,
        maxSharedKm: 7_000,
        simMaxPrice: null,
        simAcceptedPriceCategoryA: 0.38,
        simAcceptedPriceCategoryB: 0.46,
        simAcceptedDepreciationCostKm: 0.32,
        simAcceptedElectricDepreciationCostKm: 0.33,
        simMinEcoScoreForBonus: 999,
        simMaxKmForBonus: 0,
        simMaxAgeForBonus: 0,
        createdAt: null,
        updatedAt: null,
      }),
    );

    const input = simulationRunInput({ mileage: 50_000, firstRegisteredAt: new Date('2020-01-01') });
    const result = await runSimulationEngine(input);

    expect(result.resultCode).toBe('notOk');
    expect(result.rejectionReason).toBe('simulation.step.quality_criteria_not_met');
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.status).toBe(SimulationStepIcon.NOT_OK);
    expect(lastStep.message).toBe('simulation.step.quality_criteria_not_met');
  });

  it('adds an explicit NOT_OK step when price criteria are not met', async () => {
    vi.mocked(dbHubRead).mockResolvedValueOnce(
      hubSchema.parse({
        id: '550e8400-e29b-41d4-a716-4466554400ac',
        name: 'hub-price-fail',
        isDefault: true,
        simMaxAge: 15,
        simMaxKm: 250_000,
        simMinEuroNormGroupDiesel: 5,
        simDepreciationKm: 200_000,
        simDepreciationKmElectric: 300_000,
        simInspectionCostPerYear: 43,
        simMaintenanceCostPerYear: 950,
        minSharedKm: 3_000,
        avgSharedKm: 5_000,
        maxSharedKm: 7_000,
        simMaxPrice: null,
        simAcceptedPriceCategoryA: 0.01,
        simAcceptedPriceCategoryB: 0.01,
        simAcceptedDepreciationCostKm: 1,
        simAcceptedElectricDepreciationCostKm: 1,
        simMinEcoScoreForBonus: 60,
        simMaxKmForBonus: 140_000,
        simMaxAgeForBonus: 7,
        createdAt: null,
        updatedAt: null,
      }),
    );

    const input = simulationRunInput({ mileage: 50_000, firstRegisteredAt: new Date('2020-01-01'), isVan: false, seats: 5 });
    const result = await runSimulationEngine(input);

    expect(result.resultCode).toBe('notOk');
    expect(result.rejectionReason).toBe('simulation.step.price_criteria_not_met');
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.status).toBe(SimulationStepIcon.NOT_OK);
    expect(lastStep.message).toBe('simulation.step.price_criteria_not_met');
  });
});
