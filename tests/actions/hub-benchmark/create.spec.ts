import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

vi.mock('@/storage/hub-benchmark/hub-benchmark.create', () => ({
  dbHubBenchmarkCreate: vi.fn(),
}));

import { createHubBenchmark } from '@/actions/hub-benchmark/create';
import { dbHubBenchmarkCreate } from '@/storage/hub-benchmark/hub-benchmark.create';
import { hubBenchmark } from '../../builders/hub-benchmark.builder';

describe('createHubBenchmark', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('validates and creates a hub benchmark', async () => {
    const input = hubBenchmark({ id: null });
    const created = hubBenchmark({ id: 'created-id' });
    vi.mocked(dbHubBenchmarkCreate).mockResolvedValueOnce(created);

    const result = await createHubBenchmark(input);

    expect(result.id).toBe('created-id');
    expect(dbHubBenchmarkCreate).toHaveBeenCalledTimes(1);
  });

  it('throws ZodError when input is invalid', async () => {
    const invalidInput = hubBenchmark({ ownerKm: -1 } as any);

    await expect(createHubBenchmark(invalidInput)).rejects.toBeInstanceOf(ZodError);
    expect(dbHubBenchmarkCreate).not.toHaveBeenCalled();
  });
});
