import { describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/car-price-estimate/car-price-estimator', () => ({
  carValueEstimator: vi.fn().mockResolvedValue({ price: 15_000, min: 12_000, max: 18_000 }),
}));

vi.mock('@/actions/simulation/car-info-estimator', () => ({
  carInfoEstimator: vi.fn().mockResolvedValue({ cylinderCc: 1498, co2Emission: 120, ecoscore: 72, euroNormCode: 'euro-6d' }),
}));

vi.mock('@/actions/simulation/car-tax-calculator', () => ({
  calculateCarTax: vi.fn().mockImplementation(async (result: { steps: { push: (step: unknown) => void } }) => {
    result.steps.push({ status: 'info', message: 'simulation.step.car_tax_estimated' });
    return { rate: 250 };
  }),
}));

vi.mock('@/i18n/get-message', () => ({
  getMessage: vi.fn((path: string) => Promise.resolve(path)),
}));

vi.mock('@/actions/system-parameter/get-simulation-params', () => ({
  getSimulationParams: vi.fn().mockResolvedValue({ maxAgeYears: 15, maxKm: 250_000 }),
}));

vi.mock('@/storage/town/town.read', () => ({
  dbTownRead: vi.fn().mockResolvedValue({ id: 'town-1', province: { id: 'province-1' }, hub: { id: 'hub-1' } }),
}));

vi.mock('@/storage/hub/hub.read', () => ({
  dbHubRead: vi.fn().mockResolvedValue({
    id: 'hub-1',
    simDepreciationKm: 200_000,
    simDepreciationKmElectric: 300_000,
    simInspectionCostPerYear: 43,
    simMaintenanceCostPerYear: 950,
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

vi.mock('@/actions/simulation/car-insurance-calculator', () => ({
  calculateCarInsurance: vi.fn().mockImplementation(async (result: { steps: { push: (step: unknown) => void } }) => {
    result.steps.push({ status: 'info', message: 'simulation.step.car_insurance_estimated' });
    return { rate: 500 };
  }),
}));

import { carValueEstimator } from '@/actions/car-price-estimate/car-price-estimator';
import { applyAgeRule, applyMileageRule, runSimulationEngine } from '@/actions/simulation/engine';
import { SimulationStepIcon } from '@/domain/simulation.model';
import { simulationRunInput } from '../../builders/simulation.builder';

const DEFAULT_MAX_MILEAGE = 250_000;

describe('applyMileageRule', () => {
  it('adds ok step and returns true when mileage is under limit', async () => {
    const result = { steps: [] as { status: string; message: string }[] };
    const passed = await applyMileageRule(result, 100_000, DEFAULT_MAX_MILEAGE);
    expect(passed).toBe(true);
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].status).toBe(SimulationStepIcon.OK);
  });

  it('adds not_ok step and returns false when mileage is over 250_000', async () => {
    const result = { steps: [] as { status: string; message: string }[] };
    const passed = await applyMileageRule(result, 300_000, DEFAULT_MAX_MILEAGE);
    expect(passed).toBe(false);
    expect(result.steps[0].status).toBe(SimulationStepIcon.NOT_OK);
  });

  it('boundary: exactly 250_000 adds ok step and returns true', async () => {
    const result = { steps: [] as { status: string; message: string }[] };
    const passed = await applyMileageRule(result, 250_000, DEFAULT_MAX_MILEAGE);
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
    const passed = await applyAgeRule(result, recentDate, DEFAULT_MAX_AGE_YEARS);
    expect(passed).toBe(true);
    expect(result.steps[0].status).toBe(SimulationStepIcon.OK);
  });

  it('adds not_ok step and returns false when car is older than 15 years', async () => {
    const result = { steps: [] as { status: string; message: string }[] };
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 20);
    const passed = await applyAgeRule(result, oldDate, DEFAULT_MAX_AGE_YEARS);
    expect(passed).toBe(false);
    expect(result.steps[0].status).toBe(SimulationStepIcon.NOT_OK);
  });
});

describe('runSimulationEngine', () => {
  it('rejects when mileage over limit and returns steps with not_ok status', async () => {
    const input = simulationRunInput({ mileage: 300_000 });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('notOk');
    expect(result.steps).toHaveLength(1);
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

  it('calls carValueEstimator and returns steps when rules pass', async () => {
    const input = simulationRunInput({ mileage: 50_000, firstRegisteredAt: new Date('2020-01-01') });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('manualReview');
    expect(result.steps).toHaveLength(7);
    expect(result.steps[0].status).toBe(SimulationStepIcon.OK);
    expect(result.steps[1].status).toBe(SimulationStepIcon.OK);
    expect(result.steps[2].status).toBe(SimulationStepIcon.INFO);
    expect(result.steps[3].status).toBe(SimulationStepIcon.INFO);
    expect(result.steps[4].status).toBe(SimulationStepIcon.INFO);
    expect(result.steps[5].status).toBe(SimulationStepIcon.INFO);
    expect(result.steps[6].status).toBe(SimulationStepIcon.INFO);
    expect(result.carInfo).toEqual({ cylinderCc: 1498, co2Emission: 120, ecoscore: 72, euroNormCode: 'euro-6d' });
    expect(carValueEstimator).toHaveBeenCalledTimes(1);
    expect(carValueEstimator).toHaveBeenCalledWith(
      input.brand.id,
      expect.objectContaining({ id: 'fuel-1', code: 'petrol' }),
      input.carType?.id ?? null,
      input.carTypeOther,
      input.firstRegisteredAt,
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
  });
});
