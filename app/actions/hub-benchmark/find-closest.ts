import { HubBenchmark } from '@/domain/hub-benchmark.model';
import { dbHubBenchmarkFindClosest } from '@/storage/hub-benchmark/hub-benchmark.read';

export const findClosestHubBenchmark = async (hubId: string, inputKm: number): Promise<HubBenchmark | null> => {
  return dbHubBenchmarkFindClosest(hubId, inputKm);
};
