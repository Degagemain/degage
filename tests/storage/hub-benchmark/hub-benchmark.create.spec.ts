import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

vi.mock('@/storage/hub-benchmark/hub-benchmark.mappers', () => ({
  hubBenchmarkToDbCreate: vi.fn(),
  dbHubBenchmarkToDomain: vi.fn(),
}));

import { dbHubBenchmarkCreate } from '@/storage/hub-benchmark/hub-benchmark.create';
import { getPrismaClient } from '@/storage/utils';
import { dbHubBenchmarkToDomain, hubBenchmarkToDbCreate } from '@/storage/hub-benchmark/hub-benchmark.mappers';
import { hubBenchmark } from '../../builders/hub-benchmark.builder';

describe('dbHubBenchmarkCreate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates a hub benchmark and returns domain model', async () => {
    const input = hubBenchmark({ id: null, createdAt: null, updatedAt: null });
    const dbCreateData = { hubId: input.hubId, ownerKm: input.ownerKm };
    const createdDb = { ...input, id: 'new-id', createdAt: new Date(), updatedAt: new Date() };
    const expectedDomain = hubBenchmark({ id: 'new-id' });

    const mockPrisma = {
      hubBenchmark: {
        create: vi.fn().mockResolvedValue(createdDb),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(hubBenchmarkToDbCreate).mockReturnValue(dbCreateData as any);
    vi.mocked(dbHubBenchmarkToDomain).mockReturnValue(expectedDomain);

    const result = await dbHubBenchmarkCreate(input);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(hubBenchmarkToDbCreate).toHaveBeenCalledWith(input);
    expect(mockPrisma.hubBenchmark.create).toHaveBeenCalledWith({ data: dbCreateData });
    expect(dbHubBenchmarkToDomain).toHaveBeenCalledWith(createdDb);
    expect(result).toEqual(expectedDomain);
  });
});
