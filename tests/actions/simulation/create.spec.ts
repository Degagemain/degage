import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

vi.mock('@/storage/simulation/simulation.create', () => ({
  dbSimulationCreate: vi.fn(),
}));

vi.mock('@/actions/simulation/engine', () => ({
  runSimulationEngine: vi.fn().mockResolvedValue({
    resultCode: 'manualReview',
    steps: [
      { code: 'mileage_limit', status: 'ok', message: 'simulation.step.mileage_limit' },
      { code: 'car_limit', status: 'ok', message: 'simulation.step.car_limit' },
      { code: 'price_estimated', status: 'info', message: 'simulation.step.price_estimated' },
      { code: 'car_info_estimated', status: 'info', message: 'simulation.step.car_info_estimated' },
    ],
    carInfo: { cylinderCc: 1498, co2Emission: 120, ecoscore: 72, euroNormCode: 'euro-6d' },
  }),
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
    const input = simulationRunInput({ mileage: 50_000 });
    vi.mocked(dbSimulationCreate).mockImplementation(async (s) => ({ ...s, id: 'created-id' }));

    const result = await createSimulation(input);

    expect(result.brandId).toBe(input.brand.id);
    expect(result.fuelTypeId).toBe(input.fuelType.id);
    expect(result.mileage).toBe(input.mileage);
    expect(result.resultCode).toBe('manualReview');
    expect(result.steps).toHaveLength(4);
    expect(result.steps[0].code).toBe('mileage_limit');
    expect(result.steps[0].status).toBe(SimulationStepStatus.OK);
    expect(dbSimulationCreate).toHaveBeenCalledTimes(1);
  });

  it('throws ZodError when input is invalid', async () => {
    const invalidInput = simulationRunInput({ mileage: -1 } as any);

    await expect(createSimulation(invalidInput)).rejects.toBeInstanceOf(ZodError);
    expect(dbSimulationCreate).not.toHaveBeenCalled();
  });

  it('throws ZodError when car type is Other but carTypeOther is empty', async () => {
    const input = simulationRunInput({ carType: null, carTypeOther: null });

    await expect(createSimulation(input)).rejects.toBeInstanceOf(ZodError);
    expect(dbSimulationCreate).not.toHaveBeenCalled();
  });

  it('returns simulation without persisting when skipPersistence is true', async () => {
    const input = simulationRunInput({ mileage: 50_000 });

    const result = await createSimulation(input, { skipPersistence: true });

    expect(result.brandId).toBe(input.brand.id);
    expect(result.mileage).toBe(input.mileage);
    expect(result.resultCode).toBe('manualReview');
    expect(result.id).toBeNull();
    expect(dbSimulationCreate).not.toHaveBeenCalled();
  });
});
