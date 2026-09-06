import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

vi.mock('@/context/request-context', () => ({
  getRequestContentLocale: vi.fn().mockReturnValue('nl'),
}));

vi.mock('./car-tax-base-rate.mappers', () => ({
  dbCarTaxBaseRateToDomain: vi.fn((row: unknown) => row),
}));

import { dbCarTaxBaseRateFindByFiscalRegionDateAndCc } from '@/storage/car-tax-base-rate/car-tax-base-rate.read';
import { getPrismaClient } from '@/storage/utils';

/** Last covered day of each seeded tariff period. Each period ends on 30/06/YYYY (inclusive). */
const PERIOD_END_DAYS = [
  new Date(Date.UTC(2022, 5, 30)),
  new Date(Date.UTC(2023, 5, 30)),
  new Date(Date.UTC(2024, 5, 30)),
  new Date(Date.UTC(2025, 5, 30)),
  new Date(Date.UTC(2026, 5, 30)),
];

function mockFindFirst() {
  const findFirst = vi.fn().mockResolvedValue(null);
  vi.mocked(getPrismaClient).mockReturnValue({ carTaxBaseRate: { findFirst } } as any);
  return findFirst;
}

describe('dbCarTaxBaseRateFindByFiscalRegionDateAndCc', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each(PERIOD_END_DAYS)('treats the period end day %s as covered (inclusive end bound)', async (registrationDate) => {
    const findFirst = mockFindFirst();

    await dbCarTaxBaseRateFindByFiscalRegionDateAndCc('fiscal-region-1', registrationDate);

    const where = findFirst.mock.calls[0]![0].where;
    expect(where.start).toEqual({ lte: registrationDate });
    expect(where.OR).toEqual([{ end: null }, { end: { gte: registrationDate } }]);
  });

  it('adds the maxCc lower bound when a capacity is given', async () => {
    const findFirst = mockFindFirst();

    await dbCarTaxBaseRateFindByFiscalRegionDateAndCc('fiscal-region-1', new Date(Date.UTC(2024, 0, 1)), 1498);

    expect(findFirst.mock.calls[0]![0].where.maxCc).toEqual({ gte: 1498 });
  });

  it('returns null when no rate matches', async () => {
    mockFindFirst();

    const result = await dbCarTaxBaseRateFindByFiscalRegionDateAndCc('fiscal-region-1', new Date(Date.UTC(2024, 0, 1)));

    expect(result).toBeNull();
  });
});
