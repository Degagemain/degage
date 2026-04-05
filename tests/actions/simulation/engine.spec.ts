import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/car-price-estimate/car-price-estimator', () => ({
  carValueEstimator: vi.fn().mockResolvedValue({ price: 15_000, min: 12_000, max: 18_000 }),
}));

vi.mock('@/actions/simulation/car-info-estimator', () => ({
  carInfoEstimator: vi.fn().mockResolvedValue({ cylinderCc: 1498, co2Emission: 120, ecoscore: 72, euroNormCode: 'euro-6d' }),
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
  dbTownRead: vi.fn().mockResolvedValue({ id: 'town-1', province: { id: 'province-1' }, hub: { id: 'hub-1' } }),
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
    simMaxPrice: null,
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
}));

vi.mock('@/storage/fuel-type/fuel-type.read', () => ({
  dbFuelTypeRead: vi.fn().mockResolvedValue({ id: 'fuel-1', code: 'petrol' }),
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

vi.mock('@/storage/hub-benchmark/hub-benchmark.read', () => ({
  dbHubBenchmarkFindClosest: vi.fn().mockResolvedValue({ ownerKm: 15_000, sharedAvgKm: 5_000 }),
}));

vi.mock('@/storage/car-type/car-type.read', () => ({
  dbCarTypeRead: vi.fn().mockResolvedValue({ id: 'car-type-1', ecoscore: 72 }),
}));

vi.mock('@/actions/simulation/car-insurance-calculator', () => ({
  calculateCarInsurance: vi.fn().mockImplementation(async (result: { steps: { push: (step: unknown) => void } }) => {
    result.steps.push({ status: 'info', message: 'simulation.step.car_insurance_estimated' });
    return { rate: 500 };
  }),
}));

import { carValueEstimator } from '@/actions/car-price-estimate/car-price-estimator';
import { passesAgeRule, passesMileageRule, runSimulationEngine } from '@/actions/simulation/engine';
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

  it('returns manualReview when value exceeds simMaxPrice but rules would accept (higher rate)', async () => {
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
    expect(result.carInfo).toEqual({ cylinderCc: 1498, co2Emission: 120, ecoscore: 72, euroNormCode: 'euro-6d' });
  });

  it('calls carValueEstimator and returns steps when rules pass', async () => {
    const input = simulationRunInput({ mileage: 50_000, firstRegisteredAt: new Date('2020-01-01') });
    const result = await runSimulationEngine(input);
    expect(['manualReview', 'categoryA', 'categoryB', 'higherRate']).toContain(result.resultCode);
    expect(result.steps.length).toBeGreaterThanOrEqual(7);
    expect(result.steps[0].status).toBe(SimulationStepIcon.OK);
    expect(result.steps[1].status).toBe(SimulationStepIcon.OK);
    expect(result.steps[2].status).toBe(SimulationStepIcon.INFO);
    expect(result.carInfo).toEqual({ cylinderCc: 1498, co2Emission: 120, ecoscore: 72, euroNormCode: 'euro-6d' });
    expect(typeof result.duration).toBe('number');
    expect(result.duration).toBeGreaterThanOrEqual(0);
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
});
