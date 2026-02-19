import { HubBenchmark } from '@/domain/hub-benchmark.model';

export const hubBenchmark = (data: Partial<HubBenchmark> = {}): HubBenchmark => {
  return {
    id: data.id || '550e8400-e29b-41d4-a716-446655440000',
    hubId: data.hubId || '550e8400-e29b-41d4-a716-446655440099',
    ownerKm: data.ownerKm ?? 10_000,
    sharedMinKm: data.sharedMinKm ?? 2_000,
    sharedMaxKm: data.sharedMaxKm ?? 5_000,
    sharedAvgKm: data.sharedAvgKm ?? 3_500,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  };
};
