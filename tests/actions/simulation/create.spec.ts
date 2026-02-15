import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

vi.mock('@/storage/simulation/simulation.create', () => ({
  dbSimulationCreate: vi.fn(),
}));

vi.mock('@/actions/simulation/car-value-estimator', () => ({
  carValueEstimator: vi.fn().mockResolvedValue({ min: 12_000, max: 18_000 }),
}));

vi.mock('@/actions/system-parameter/get-simulation-params', () => ({
  getSimulationParams: vi.fn().mockResolvedValue({ maxAgeYears: 15, maxKm: 250_000 }),
}));

import { createSimulation } from '@/actions/simulation/create';
import { dbSimulationCreate } from '@/storage/simulation/simulation.create';
import { SimulationStepStatus } from '@/domain/simulation.model';
import { simulationRunInput } from '../../builders/simulation.builder';

describe('createSimulation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('validates input, runs engine and returns simulation', async () => {
    const input = simulationRunInput({ km: 50_000 });
    vi.mocked(dbSimulationCreate).mockImplementation(async (s) => ({ ...s, id: 'created-id' }));

    const result = await createSimulation(input);

    expect(result.brandId).toBe(input.brandId);
    expect(result.fuelTypeId).toBe(input.fuelTypeId);
    expect(result.km).toBe(input.km);
    expect(result.resultCode).toBe('manualReview');
    expect(result.steps).toHaveLength(3);
    expect(result.steps[0].code).toBe('km_limit');
    expect(result.steps[0].status).toBe(SimulationStepStatus.OK);
    expect(dbSimulationCreate).toHaveBeenCalledTimes(1);
  });

  it('throws ZodError when input is invalid', async () => {
    const invalidInput = simulationRunInput({ km: -1 } as any);

    await expect(createSimulation(invalidInput)).rejects.toBeInstanceOf(ZodError);
    expect(dbSimulationCreate).not.toHaveBeenCalled();
  });

  it('throws ZodError when car type is Other but carTypeOther is empty', async () => {
    const input = simulationRunInput({ carTypeId: null, carTypeOther: null });

    await expect(createSimulation(input)).rejects.toBeInstanceOf(ZodError);
    expect(dbSimulationCreate).not.toHaveBeenCalled();
  });
});
