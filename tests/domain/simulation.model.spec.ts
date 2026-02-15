import { describe, expect, it } from 'vitest';
import {
  SimulationResultCode,
  SimulationStepCode,
  SimulationStepStatus,
  simulationRunInputParseSchema,
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

describe('simulationRunInputParseSchema', () => {
  it('accepts valid run input with IdName for town, brand, fuelType, carType', () => {
    const result = simulationRunInputParseSchema.safeParse({
      town: { id: '550e8400-e29b-41d4-a716-446655440099' },
      brand: { id: '550e8400-e29b-41d4-a716-446655440001' },
      fuelType: { id: '550e8400-e29b-41d4-a716-446655440002' },
      carType: { id: '550e8400-e29b-41d4-a716-446655440003' },
      carTypeOther: null,
      km: 50_000,
      firstRegisteredAt: '2020-01-01',
      isVan: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects when carType is null and carTypeOther is empty', () => {
    const result = simulationRunInputParseSchema.safeParse({
      town: { id: '550e8400-e29b-41d4-a716-446655440099' },
      brand: { id: '550e8400-e29b-41d4-a716-446655440001' },
      fuelType: { id: '550e8400-e29b-41d4-a716-446655440002' },
      carType: null,
      carTypeOther: null,
      km: 50_000,
      firstRegisteredAt: '2020-01-01',
      isVan: false,
    });
    expect(result.success).toBe(false);
  });
});

describe('simulationSchema', () => {
  it('accepts valid simulation', () => {
    const result = simulationSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      townId: '550e8400-e29b-41d4-a716-446655440099',
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
      townId: '550e8400-e29b-41d4-a716-446655440099',
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
