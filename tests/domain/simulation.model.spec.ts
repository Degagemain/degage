import { describe, expect, it } from 'vitest';
import {
  SimulationResultCode,
  SimulationStepCode,
  SimulationStepStatus,
  simulationSchema,
  simulationStepSchema,
} from '@/domain/simulation.model';

describe('simulationStepSchema', () => {
  it('accepts valid step', () => {
    const result = simulationStepSchema.safeParse({
      code: SimulationStepCode.KM_LIMIT,
      status: SimulationStepStatus.OK,
      message: 'Less than 250 000 km',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = simulationStepSchema.safeParse({
      code: SimulationStepCode.KM_LIMIT,
      status: 'invalid',
      message: 'x',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid code', () => {
    const result = simulationStepSchema.safeParse({
      code: 'unknown_code',
      status: SimulationStepStatus.OK,
      message: 'x',
    });
    expect(result.success).toBe(false);
  });
});

describe('simulationSchema', () => {
  it('accepts valid simulation', () => {
    const result = simulationSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      brandId: '550e8400-e29b-41d4-a716-446655440001',
      fuelTypeId: '550e8400-e29b-41d4-a716-446655440002',
      carTypeId: null,
      carTypeOther: null,
      km: 100_000,
      firstRegisteredAt: new Date('2019-01-01'),
      isVan: false,
      resultCode: SimulationResultCode.NOT_OK,
      estimatedPrice: null,
      steps: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('rejects km less than 0', () => {
    const result = simulationSchema.safeParse({
      id: null,
      brandId: '550e8400-e29b-41d4-a716-446655440001',
      fuelTypeId: '550e8400-e29b-41d4-a716-446655440002',
      carTypeId: null,
      carTypeOther: null,
      km: -1,
      firstRegisteredAt: new Date(),
      isVan: false,
      resultCode: SimulationResultCode.MANUAL_REVIEW,
      estimatedPrice: 10_000,
      steps: [],
      createdAt: null,
      updatedAt: null,
    });
    expect(result.success).toBe(false);
  });
});
