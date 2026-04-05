import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/simulation/search', () => ({
  searchSimulations: vi.fn(),
}));

import { exportSimulations } from '@/actions/simulation/export';
import { searchSimulations } from '@/actions/simulation/search';
import { MaxTake, SortOrder } from '@/domain/utils';
import { SimulationSortColumns } from '@/domain/simulation.filter';
import { SimulationResultCode } from '@/domain/simulation.model';
import { simulation } from '../../builders/simulation.builder';

describe('exportSimulations', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const baseFilter = {
    query: null as string | null,
    brandIds: [] as string[],
    fuelTypeIds: [] as string[],
    carTypeIds: [] as string[],
    resultCodes: [] as SimulationResultCode[],
    sortBy: SimulationSortColumns.CREATED_AT,
    sortOrder: SortOrder.DESC,
  };

  it('returns all records in a single page when under batch size', async () => {
    const one = simulation({ id: 'a' });
    vi.mocked(searchSimulations).mockResolvedValueOnce({ records: [one], total: 1 });

    const result = await exportSimulations(baseFilter);

    expect(result).toEqual([one]);
    expect(searchSimulations).toHaveBeenCalledTimes(1);
    expect(searchSimulations).toHaveBeenCalledWith({ ...baseFilter, skip: 0, take: MaxTake });
  });

  it('pages until all records are collected', async () => {
    const batch = MaxTake;
    const firstBatch = Array.from({ length: batch }, (_, i) => simulation({ id: `id-${i}` }));
    const secondBatch = [simulation({ id: 'last' })];

    vi.mocked(searchSimulations)
      .mockResolvedValueOnce({ records: firstBatch, total: batch + 1 })
      .mockResolvedValueOnce({ records: secondBatch, total: batch + 1 });

    const result = await exportSimulations(baseFilter);

    expect(result).toHaveLength(batch + 1);
    expect(searchSimulations).toHaveBeenCalledTimes(2);
    expect(searchSimulations).toHaveBeenNthCalledWith(1, { ...baseFilter, skip: 0, take: batch });
    expect(searchSimulations).toHaveBeenNthCalledWith(2, { ...baseFilter, skip: batch, take: batch });
  });

  it('stops when a page is empty', async () => {
    vi.mocked(searchSimulations).mockResolvedValueOnce({ records: [], total: 0 });

    const result = await exportSimulations(baseFilter);

    expect(result).toEqual([]);
    expect(searchSimulations).toHaveBeenCalledTimes(1);
  });
});
