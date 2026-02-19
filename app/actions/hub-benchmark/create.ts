import { HubBenchmark, hubBenchmarkSchema } from '@/domain/hub-benchmark.model';
import { dbHubBenchmarkCreate } from '@/storage/hub-benchmark/hub-benchmark.create';

export const createHubBenchmark = async (hb: HubBenchmark): Promise<HubBenchmark> => {
  const validated = hubBenchmarkSchema.parse(hb);
  return dbHubBenchmarkCreate(validated);
};
