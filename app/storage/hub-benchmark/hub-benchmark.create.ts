import { HubBenchmark } from '@/domain/hub-benchmark.model';
import { getPrismaClient } from '@/storage/utils';
import { dbHubBenchmarkToDomain, hubBenchmarkToDbCreate } from './hub-benchmark.mappers';

export const dbHubBenchmarkCreate = async (hb: HubBenchmark): Promise<HubBenchmark> => {
  const prisma = getPrismaClient();
  const created = await prisma.hubBenchmark.create({
    data: hubBenchmarkToDbCreate(hb),
  });
  return dbHubBenchmarkToDomain(created);
};
