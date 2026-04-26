import { describe, expect, it } from 'vitest';
import {
  SimulationResultCode,
  SimulationStepIcon,
  simulationRunInputParseSchema,
  simulationSchema,
  simulationStepSchema,
  simulationUpdateBodySchema,
} from '@/domain/simulation.model';

describe('simulationStepSchema', () => {
  it('accepts valid step with status and message', () => {
    const result = simulationStepSchema.safeParse({
      status: SimulationStepIcon.OK,
      message: 'Less than 250 000 km',
    });
    expect(result.success).toBe(true);
  });

  it('strips unknown keys', () => {
    const result = simulationStepSchema.safeParse({
      code: 'mileage_limit',
      status: SimulationStepIcon.OK,
      message: 'x',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ status: SimulationStepIcon.OK, message: 'x' });
  });

  it('rejects invalid status', () => {
    const result = simulationStepSchema.safeParse({
      status: 'invalid',
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
      mileage: 50_000,
      ownerKmPerYear: 10_000,
      seats: 5,
      firstRegisteredAt: '2020-01-01',
      isVan: false,
      isNewCar: false,
      purchasePrice: null,
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
      mileage: 50_000,
      ownerKmPerYear: 10_000,
      seats: 5,
      firstRegisteredAt: '2020-01-01',
      isVan: false,
    });
    expect(result.success).toBe(false);
  });
});

describe('simulationSchema', () => {
  const simRelations = {
    town: { id: '550e8400-e29b-41d4-a716-446655440099' },
    brand: { id: '550e8400-e29b-41d4-a716-446655440001' },
    fuelType: { id: '550e8400-e29b-41d4-a716-446655440002' },
    carType: null as { id: string; name?: string } | null,
    carTypeOther: null,
  };

  it('accepts valid simulation', () => {
    const result = simulationSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      ...simRelations,
      mileage: 100_000,
      ownerKmPerYear: 20_000,
      seats: 5,
      firstRegisteredAt: new Date('2019-01-01'),
      isVan: false,
      isNewCar: false,
      purchasePrice: null,
      rejectionReason: null,
      resultCode: SimulationResultCode.NOT_OK,
      steps: [],
      email: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid email when set', () => {
    const result = simulationSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      ...simRelations,
      mileage: 0,
      ownerKmPerYear: 0,
      seats: 5,
      firstRegisteredAt: new Date(),
      isVan: false,
      isNewCar: false,
      purchasePrice: null,
      rejectionReason: null,
      resultCode: SimulationResultCode.CATEGORY_A,
      steps: [],
      email: 'user@example.com',
      createdAt: null,
      updatedAt: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = simulationSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      ...simRelations,
      mileage: 0,
      ownerKmPerYear: 0,
      seats: 5,
      firstRegisteredAt: new Date(),
      isVan: false,
      resultCode: SimulationResultCode.CATEGORY_A,
      steps: [],
      email: 'not-an-email',
      createdAt: null,
      updatedAt: null,
    });
    expect(result.success).toBe(false);
  });

  it('rejects mileage less than 0', () => {
    const result = simulationSchema.safeParse({
      id: null,
      ...simRelations,
      mileage: -1,
      ownerKmPerYear: 0,
      seats: 5,
      firstRegisteredAt: new Date(),
      isVan: false,
      resultCode: SimulationResultCode.MANUAL_REVIEW,
      steps: [],
      createdAt: null,
      updatedAt: null,
    });
    expect(result.success).toBe(false);
  });
});

describe('simulationUpdateBodySchema', () => {
  it('parses id and email and coerces empty string to null', () => {
    const result = simulationUpdateBodySchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe(null);
    }
  });

  it('rejects unknown fields', () => {
    const result = simulationUpdateBodySchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'a@b.co',
      emailLocale: 'fr',
    });
    expect(result.success).toBe(false);
  });
});
