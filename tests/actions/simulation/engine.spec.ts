import { describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/simulation/car-value-estimator', () => ({
  carValueEstimator: vi.fn().mockResolvedValue({ min: 12_000, max: 18_000 }),
}));

vi.mock('@/i18n/get-message', () => ({
  getMessage: vi.fn((path: string) => Promise.resolve(path)),
}));

vi.mock('@/actions/system-parameter/get-simulation-params', () => ({
  getSimulationParams: vi.fn().mockResolvedValue({ maxAgeYears: 15, maxKm: 250_000 }),
}));

import { carValueEstimator } from '@/actions/simulation/car-value-estimator';
import { applyAgeRule, applyKmRule, runSimulationEngine } from '@/actions/simulation/engine';
import { SimulationStepCode, SimulationStepStatus } from '@/domain/simulation.model';
import { simulationRunInput } from '../../builders/simulation.builder';

const DEFAULT_MAX_KM = 250_000;

describe('applyKmRule', () => {
  it('returns ok step when km is under limit', () => {
    const result = applyKmRule(100_000, DEFAULT_MAX_KM);
    expect(result.reject).toBe(false);
    expect(result.code).toBe(SimulationStepCode.KM_LIMIT);
    expect(result.status).toBe(SimulationStepStatus.OK);
  });

  it('returns not_ok step when km is over 250_000', () => {
    const result = applyKmRule(300_000, DEFAULT_MAX_KM);
    expect(result.reject).toBe(true);
    expect(result.code).toBe(SimulationStepCode.KM_LIMIT);
    expect(result.status).toBe(SimulationStepStatus.NOT_OK);
  });

  it('boundary: exactly 250_000 is under limit', () => {
    const result = applyKmRule(250_000, DEFAULT_MAX_KM);
    expect(result.reject).toBe(false);
    expect(result.code).toBe(SimulationStepCode.KM_LIMIT);
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
  it('rejects when km over limit and returns steps with km_limit not_ok', async () => {
    const input = simulationRunInput({ km: 300_000 });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('notOk');
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].code).toBe(SimulationStepCode.KM_LIMIT);
    expect(result.steps[0].status).toBe(SimulationStepStatus.NOT_OK);
    expect(carValueEstimator).not.toHaveBeenCalled();
  });

  it('rejects when car too old and returns steps with car_limit not_ok', async () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 20);
    const input = simulationRunInput({ firstRegisteredAt: oldDate, km: 50_000 });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('notOk');
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].code).toBe(SimulationStepCode.KM_LIMIT);
    expect(result.steps[1].code).toBe(SimulationStepCode.CAR_LIMIT);
    expect(result.steps[1].status).toBe(SimulationStepStatus.NOT_OK);
    expect(carValueEstimator).not.toHaveBeenCalled();
  });

  it('calls carValueEstimator and returns steps with price_estimated when rules pass', async () => {
    const input = simulationRunInput({ km: 50_000, firstRegisteredAt: new Date('2020-01-01') });
    const result = await runSimulationEngine(input);
    expect(result.resultCode).toBe('manualReview');
    expect(result.steps).toHaveLength(3);
    expect(result.steps[0].code).toBe(SimulationStepCode.KM_LIMIT);
    expect(result.steps[1].code).toBe(SimulationStepCode.CAR_LIMIT);
    expect(result.steps[2].code).toBe(SimulationStepCode.PRICE_ESTIMATED);
    expect(result.steps[2].status).toBe(SimulationStepStatus.INFO);
    expect(carValueEstimator).toHaveBeenCalledTimes(1);
    expect(carValueEstimator).toHaveBeenCalledWith(input.brandId, input.carTypeId, input.carTypeOther, input.firstRegisteredAt);
  });
});
