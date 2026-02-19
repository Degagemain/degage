import { dbHubBenchmarkDelete } from '@/storage/hub-benchmark/hub-benchmark.delete';

export const deleteHubBenchmark = async (id: string): Promise<void> => {
  await dbHubBenchmarkDelete(id);
};
