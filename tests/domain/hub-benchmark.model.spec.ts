import { describe, expect, it } from 'vitest';
import { hubBenchmarkSchema } from '@/domain/hub-benchmark.model';

describe('hubBenchmarkSchema', () => {
  const validData = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    hubId: '550e8400-e29b-41d4-a716-446655440099',
    ownerKm: 10_000,
    sharedMinKm: 2_000,
    sharedMaxKm: 5_000,
    sharedAvgKm: 3_500,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('accepts valid hub benchmark', () => {
    const result = hubBenchmarkSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('defaults sharedMinKm, sharedMaxKm, sharedAvgKm to 0', () => {
    const result = hubBenchmarkSchema.safeParse({
      id: null,
      hubId: '550e8400-e29b-41d4-a716-446655440099',
      ownerKm: 5_000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sharedMinKm).toBe(0);
      expect(result.data.sharedMaxKm).toBe(0);
      expect(result.data.sharedAvgKm).toBe(0);
    }
  });

  it('rejects negative ownerKm', () => {
    const result = hubBenchmarkSchema.safeParse({ ...validData, ownerKm: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects negative sharedMinKm', () => {
    const result = hubBenchmarkSchema.safeParse({ ...validData, sharedMinKm: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects missing hubId', () => {
    const { hubId: _, ...noHub } = validData;
    const result = hubBenchmarkSchema.safeParse(noHub);
    expect(result.success).toBe(false);
  });
});
