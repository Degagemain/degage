import { HubBenchmark } from '@/domain/hub-benchmark.model';
import { getPrismaClient } from '@/storage/utils';
import { dbHubBenchmarkToDomain, hubBenchmarkToDbUpdate } from './hub-benchmark.mappers';

export const dbHubBenchmarkUpdate = async (hb: HubBenchmark): Promise<HubBenchmark> => {
  const prisma = getPrismaClient();
  const updated = await prisma.hubBenchmark.update({
    where: { id: hb.id! },
    data: hubBenchmarkToDbUpdate(hb),
  });
  return dbHubBenchmarkToDomain(updated);
};
