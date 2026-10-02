import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-price-estimate/car-price-estimate.find-by-car-type-year', () => ({
  dbCarPriceEstimateFindByCarTypeAndYear: vi.fn(),
}));
vi.mock('@/storage/car-price-estimate/car-price-estimate.create', () => ({
  dbCarPriceEstimateCreate: vi.fn(),
}));
vi.mock('@/storage/car-type/car-type.read', () => ({ dbCarTypeRead: vi.fn() }));
vi.mock('@/storage/car-brand/car-brand.read', () => ({ dbCarBrandRead: vi.fn() }));
vi.mock('@/integrations/gemini', () => ({ generateGroundedJson: vi.fn() }));
vi.mock('@/lib/logger', () => ({ logger: { warn: vi.fn() } }));

import { assertValidPriceEstimate, carValueEstimator } from '@/actions/car-price-estimate/car-price-estimator';
import { InvalidCarPriceEstimateError } from '@/actions/car-price-estimate/invalid-car-price-estimate.error';
import type { CarBrand } from '@/domain/car-brand.model';
import type { CarPriceEstimate } from '@/domain/car-price-estimate.model';
import type { CarType } from '@/domain/car-type.model';
import { generateGroundedJson } from '@/integrations/gemini';
import { dbCarBrandRead } from '@/storage/car-brand/car-brand.read';
import { dbCarPriceEstimateCreate } from '@/storage/car-price-estimate/car-price-estimate.create';
import { dbCarPriceEstimateFindByCarTypeAndYear } from '@/storage/car-price-estimate/car-price-estimate.find-by-car-type-year';
import { dbCarTypeRead } from '@/storage/car-type/car-type.read';
import { fuelType } from '../../builders/fuel-type.builder';

describe('assertValidPriceEstimate', () => {
  const valid = {
    price: 15_000,
    rangeMin: 8_000,
    rangeMax: 18_000,
    remarks: null,
    articleRefs: [],
  };

  it('accepts a coherent estimate', () => {
    expect(() => assertValidPriceEstimate(valid)).not.toThrow();
  });

  it('rejects non-positive price', () => {
    expect(() => assertValidPriceEstimate({ ...valid, price: 0 })).toThrow(InvalidCarPriceEstimateError);
  });

  it('rejects non-positive rangeMin', () => {
    expect(() => assertValidPriceEstimate({ ...valid, rangeMin: 0 })).toThrow(InvalidCarPriceEstimateError);
  });

  it('rejects rangeMin above price', () => {
    expect(() => assertValidPriceEstimate({ ...valid, rangeMin: 20_000 })).toThrow(InvalidCarPriceEstimateError);
  });
});

describe('carValueEstimator', () => {
  const carTypeId = '550e8400-e29b-41d4-a716-446655440001';
  const firstRegistrationDate = new Date('2020-03-01');
  const generated = { price: 15_000, rangeMin: 8_000, rangeMax: 18_000, remarks: null, articleRefs: [] };
  const uniqueError = Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });

  const cachedRow = (data: Partial<CarPriceEstimate> = {}): CarPriceEstimate => ({
    id: '550e8400-e29b-41d4-a716-446655440002',
    carType: { id: carTypeId },
    year: 2020,
    estimateYear: 2026,
    price: 14_000,
    rangeMin: 7_000,
    rangeMax: 17_000,
    prompt: null,
    remarks: null,
    articleRefs: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  });

  const estimate = () => carValueEstimator('brand-id', fuelType(), carTypeId, null, firstRegistrationDate, 200_000, 2026);

  beforeEach(() => {
    vi.mocked(dbCarBrandRead).mockResolvedValue({ name: 'Toyota' } as CarBrand);
    vi.mocked(dbCarTypeRead).mockResolvedValue({ name: 'Yaris' } as CarType);
    vi.mocked(generateGroundedJson).mockResolvedValue(generated);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('caches and returns the generated estimate on a cache miss', async () => {
    vi.mocked(dbCarPriceEstimateFindByCarTypeAndYear).mockResolvedValueOnce(null);
    vi.mocked(dbCarPriceEstimateCreate).mockResolvedValueOnce(cachedRow());

    await expect(estimate()).resolves.toEqual({ price: 15_000, min: 8_000, max: 18_000 });
    expect(dbCarPriceEstimateCreate).toHaveBeenCalledTimes(1);
  });

  it('returns the existing cache row when the insert loses a unique-key race', async () => {
    vi.mocked(dbCarPriceEstimateFindByCarTypeAndYear).mockResolvedValueOnce(null).mockResolvedValueOnce(cachedRow());
    vi.mocked(dbCarPriceEstimateCreate).mockRejectedValueOnce(uniqueError);

    await expect(estimate()).resolves.toEqual({ price: 14_000, min: 7_000, max: 17_000 });
    expect(dbCarPriceEstimateFindByCarTypeAndYear).toHaveBeenLastCalledWith(carTypeId, 2020, 2026);
  });

  it('rejects a malformed cache row after a unique-key race', async () => {
    vi.mocked(dbCarPriceEstimateFindByCarTypeAndYear)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(cachedRow({ rangeMin: 20_000 }));
    vi.mocked(dbCarPriceEstimateCreate).mockRejectedValueOnce(uniqueError);

    await expect(estimate()).rejects.toThrow(InvalidCarPriceEstimateError);
  });

  it('rethrows the unique-key error when no cache row exists after the conflict', async () => {
    vi.mocked(dbCarPriceEstimateFindByCarTypeAndYear).mockResolvedValue(null);
    vi.mocked(dbCarPriceEstimateCreate).mockRejectedValueOnce(uniqueError);

    await expect(estimate()).rejects.toBe(uniqueError);
  });

  it('rethrows unrelated storage errors', async () => {
    const dbError = Object.assign(new Error('Connection lost'), { code: 'P1001' });
    vi.mocked(dbCarPriceEstimateFindByCarTypeAndYear).mockResolvedValueOnce(null);
    vi.mocked(dbCarPriceEstimateCreate).mockRejectedValueOnce(dbError);

    await expect(estimate()).rejects.toBe(dbError);
    expect(dbCarPriceEstimateFindByCarTypeAndYear).toHaveBeenCalledTimes(1);
  });
});
