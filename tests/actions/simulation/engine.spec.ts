import { describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/car-price-estimate/car-price-estimator', () => ({
  carValueEstimator: vi.fn().mockResolvedValue({ price: 15_000, min: 12_000, max: 18_000 }),
}));

vi.mock('@/actions/simulation/car-info-estimator', () => ({
  carInfoEstimator: vi.fn().mockResolvedValue({ cylinderCc: 1498, co2Emission: 120, ecoscore: 72, euroNormCode: 'euro-6d' }),
}));

vi.mock('@/actions/simulation/car-tax-calculator', () => ({
  calculateCarTax: vi.fn().mockResolvedValue({
    rate: 250,
    steps: [{ code: 'car_tax_estimated', status: 'info', message: 'simulation.step.car_tax_estimated' }],
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

vi.mock('@/storage/euro-norm/euro-norm.read', () => ({
  dbEuroNormFindByCode: vi.fn().mockResolvedValue({ id: 'euro-norm-1', group: 6 }),
}));

vi.mock('@/storage/hub-benchmark/hub-benchmark.read', () => ({
  dbHubBenchmarkFindClosest: vi.fn().mockResolvedValue({ ownerKm: 15_000, sharedAvgKm: 5_000 }),
}));

vi.mock('@/actions/simulation/car-insurance-calculator', () => ({
  calculateCarInsurance: vi.fn().mockResolvedValue({
    rate: 500,
    steps: [{ code: 'car_insurance_estimated', status: 'info', message: 'simulation.step.car_insurance_estimated' }],
  }),
}));

import { carValueEstimator } from '@/actions/car-price-estimate/car-price-estimator';
import { applyAgeRule, applyMileageRule, runSimulationEngine } from '@/actions/simulation/engine';
import { SimulationStepCode, SimulationStepStatus } from '@/domain/simulation.model';
import { simulationRunInput } from '../../builders/simulation.builder';

const DEFAULT_MAX_MILEAGE = 250_000;

describe('applyMileageRule', () => {
  it('returns ok step when mileage is under limit', () => {
    const result = applyMileageRule(100_000, DEFAULT_MAX_MILEAGE);
    expect(result.reject).toBe(false);
    expect(result.code).toBe(SimulationStepCode.MILEAGE_LIMIT);
    expect(result.status).toBe(SimulationStepStatus.OK);
  });

  it('returns not_ok step when mileage is over 250_000', () => {
    const result = applyMileageRule(300_000, DEFAULT_MAX_MILEAGE);
    expect(result.reject).toBe(true);
    expect(result.code).toBe(SimulationStepCode.MILEAGE_LIMIT);
    expect(result.status).toBe(SimulationStepStatus.NOT_OK);
  });

  it('boundary: exactly 250_000 is under limit', () => {
    const result = applyMileageRule(250_000, DEFAULT_MAX_MILEAGE);
    expect(result.reject).toBe(false);
    expect(result.code).toBe(SimulationStepCode.MILEAGE_LIMIT);
  });
});

const DEFAULT_MAX_AGE_YEARS = 15;

describe('applyAgeRule', () => {
  it('returns ok step when car is not older than 15 years', () => {
    const recentDate = new Date();
    recentDate.setFullYear(recentDate.getFullYear() - 5);
    const result = applyAgeRule(recentDate, DEFAULT_MAX_AGE_YEARS);
    expect(result.reject).toBe(false);
    expect(result.code).toBe(SimulationStepCode.CAR_LIMIT);
    expect(result.status).toBe(SimulationStepStatus.OK);
  });

  it('returns not_ok step when car is older than 15 years', () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 20);
    const result = applyAgeRule(oldDate, DEFAULT_MAX_AGE_YEARS);
    expect(result.reject).toBe(true);
    expect(result.code).toBe(SimulationStepCode.CAR_LIMIT);
    expect(result.status).toBe(SimulationStepStatus.NOT_OK);
  });
});

describe('runSimulationEngine', () => {
  it('rejects when mileage over limit and returns steps with mileage_limit not_ok', async () => {
    const input = simulationRunInput({ mileage: 300_000 });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('notOk');
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].code).toBe(SimulationStepCode.MILEAGE_LIMIT);
    expect(result.steps[0].status).toBe(SimulationStepStatus.NOT_OK);
    expect(carValueEstimator).not.toHaveBeenCalled();
  });

  it('rejects when car too old and returns steps with car_limit not_ok', async () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 20);
    const input = simulationRunInput({ firstRegisteredAt: oldDate, mileage: 50_000 });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('notOk');
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].code).toBe(SimulationStepCode.MILEAGE_LIMIT);
    expect(result.steps[1].code).toBe(SimulationStepCode.CAR_LIMIT);
    expect(result.steps[1].status).toBe(SimulationStepStatus.NOT_OK);
    expect(carValueEstimator).not.toHaveBeenCalled();
  });

  it('calls carValueEstimator and returns steps with price_estimated when rules pass', async () => {
    const input = simulationRunInput({ mileage: 50_000, firstRegisteredAt: new Date('2020-01-01') });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('manualReview');
    expect(result.steps).toHaveLength(7);
    expect(result.steps[0].code).toBe(SimulationStepCode.MILEAGE_LIMIT);
    expect(result.steps[1].code).toBe(SimulationStepCode.CAR_LIMIT);
    expect(result.steps[2].code).toBe(SimulationStepCode.PRICE_ESTIMATED);
    expect(result.steps[2].status).toBe(SimulationStepStatus.INFO);
    expect(result.steps[3].code).toBe(SimulationStepCode.CAR_INFO_ESTIMATED);
    expect(result.steps[3].status).toBe(SimulationStepStatus.INFO);
    expect(result.steps[4].code).toBe(SimulationStepCode.CAR_TAX_ESTIMATED);
    expect(result.steps[4].status).toBe(SimulationStepStatus.INFO);
    expect(result.steps[5].code).toBe(SimulationStepCode.CAR_INSURANCE_ESTIMATED);
    expect(result.steps[6].code).toBe(SimulationStepCode.YEARLY_MILEAGE_ESTIMATE);
    expect(result.carInfo).toEqual({ cylinderCc: 1498, co2Emission: 120, ecoscore: 72, euroNormCode: 'euro-6d' });
    expect(carValueEstimator).toHaveBeenCalledTimes(1);
    expect(carValueEstimator).toHaveBeenCalledWith(
      input.brand.id,
      input.fuelType.id,
      input.carType?.id ?? null,
      input.carTypeOther,
      input.firstRegisteredAt,
    );
  });
});
