import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

import { dbHubBenchmarkFindClosest } from '@/storage/hub-benchmark/hub-benchmark.read';
import { getPrismaClient } from '@/storage/utils';

const HUB_ID = '550e8400-e29b-41d4-a716-446655440099';

describe('dbHubBenchmarkFindClosest', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the closest benchmark where ownerKm >= inputKm', async () => {
    const dbRow = {
      id: 'bm-1',
      hubId: HUB_ID,
      ownerKm: 15_000,
      sharedMinKm: 3_000,
      sharedMaxKm: 7_000,
      sharedAvgKm: 5_000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockPrisma = {
      hubBenchmark: {
        findFirst: vi.fn().mockResolvedValue(dbRow),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    const result = await dbHubBenchmarkFindClosest(HUB_ID, 12_000);

    expect(result).not.toBeNull();
    expect(result!.ownerKm).toBe(15_000);
    expect(mockPrisma.hubBenchmark.findFirst).toHaveBeenCalledWith({
      where: { hubId: HUB_ID, ownerKm: { gte: 12_000 } },
      orderBy: { ownerKm: 'asc' },
    });
  });

  it('falls back to the largest ownerKm when inputKm exceeds all benchmarks', async () => {
    const fallbackRow = {
      id: 'bm-max',
      hubId: HUB_ID,
      ownerKm: 24_000,
      sharedMinKm: 1_400,
      sharedMaxKm: 10_000,
      sharedAvgKm: 3_000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockPrisma = {
      hubBenchmark: {
        findFirst: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(fallbackRow),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    const result = await dbHubBenchmarkFindClosest(HUB_ID, 999_999);

    expect(result).not.toBeNull();
    expect(result!.ownerKm).toBe(24_000);
    expect(mockPrisma.hubBenchmark.findFirst).toHaveBeenCalledTimes(2);
    expect(mockPrisma.hubBenchmark.findFirst).toHaveBeenNthCalledWith(1, {
      where: { hubId: HUB_ID, ownerKm: { gte: 999_999 } },
      orderBy: { ownerKm: 'asc' },
    });
    expect(mockPrisma.hubBenchmark.findFirst).toHaveBeenNthCalledWith(2, {
      where: { hubId: HUB_ID },
      orderBy: { ownerKm: 'desc' },
    });
  });

  it('returns null when hub has no benchmarks at all', async () => {
    const mockPrisma = {
      hubBenchmark: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    const result = await dbHubBenchmarkFindClosest(HUB_ID, 999_999);

    expect(result).toBeNull();
    expect(mockPrisma.hubBenchmark.findFirst).toHaveBeenCalledTimes(2);
  });
});
