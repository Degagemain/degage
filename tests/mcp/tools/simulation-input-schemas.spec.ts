import { describe, expect, it } from 'vitest';
import { simulationRunInputParseSchema } from '@/domain/simulation.model';

const baseInput = {
  town: { id: '550e8400-e29b-41d4-a716-446655440099', name: 'Gent' },
  brand: { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Toyota' },
  fuelType: { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Petrol' },
  carType: { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Yaris' },
  carTypeOther: null,
  ownerKmPerYear: 10_000,
  seats: 5,
  firstRegisteredAt: '2020-01-01',
  isVan: false,
};

describe('simulation MCP input schemas', () => {
  it('parses valid existing-car input through simulationRunInputParseSchema', () => {
    const parsed = simulationRunInputParseSchema.safeParse({
      ...baseInput,
      mileage: 50_000,
      isPurchased: false,
      isNewCar: false,
      purchasePrice: null,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.isPurchased).toBe(false);
      expect(parsed.data.mileage).toBe(50_000);
    }
  });

  it('parses valid purchased-car input through simulationRunInputParseSchema', () => {
    const parsed = simulationRunInputParseSchema.safeParse({
      ...baseInput,
      mileage: 15_000,
      isPurchased: true,
      isNewCar: false,
      purchasePrice: 18_500,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.isPurchased).toBe(true);
      expect(parsed.data.purchasePrice).toBe(18_500);
    }
  });

  it('parses brand-new purchased car with mileage 0', () => {
    const parsed = simulationRunInputParseSchema.safeParse({
      ...baseInput,
      mileage: 0,
      firstRegisteredAt: '2026-07-12',
      isPurchased: true,
      isNewCar: true,
      purchasePrice: 32_000,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.isNewCar).toBe(true);
      expect(parsed.data.mileage).toBe(0);
    }
  });

  it('rejects isNewCar without isPurchased', () => {
    const parsed = simulationRunInputParseSchema.safeParse({
      ...baseInput,
      mileage: 0,
      firstRegisteredAt: '2026-07-12',
      isPurchased: false,
      isNewCar: true,
      purchasePrice: null,
    });
    expect(parsed.success).toBe(false);
  });

  it('requires carTypeOther when carType is null', () => {
    const parsed = simulationRunInputParseSchema.safeParse({
      ...baseInput,
      carType: null,
      carTypeOther: null,
      mileage: 50_000,
      isPurchased: false,
      purchasePrice: null,
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts carTypeOther when carType is null', () => {
    const parsed = simulationRunInputParseSchema.safeParse({
      ...baseInput,
      carType: null,
      carTypeOther: 'Custom hatchback',
      mileage: 50_000,
      isPurchased: false,
      purchasePrice: null,
    });
    expect(parsed.success).toBe(true);
  });
});
