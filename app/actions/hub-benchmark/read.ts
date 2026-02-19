import { HubBenchmark } from '@/domain/hub-benchmark.model';
import { dbHubBenchmarkRead } from '@/storage/hub-benchmark/hub-benchmark.read';

export const readHubBenchmark = async (id: string): Promise<HubBenchmark> => {
  return dbHubBenchmarkRead(id);
};
