import * as z from 'zod';
import { HubBenchmark, hubBenchmarkSchema } from '@/domain/hub-benchmark.model';
import { dbHubBenchmarkUpdate } from '@/storage/hub-benchmark/hub-benchmark.update';

export const updateHubBenchmark = async (hb: HubBenchmark): Promise<HubBenchmark> => {
  const validated = hubBenchmarkSchema.parse(hb);
  z.uuid().parse(validated.id);
  return dbHubBenchmarkUpdate(validated);
};
