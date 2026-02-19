import { HubBenchmark } from '@/domain/hub-benchmark.model';
import { HubBenchmarkFilter } from '@/domain/hub-benchmark.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { dbHubBenchmarkToDomainWithRelations } from './hub-benchmark.mappers';

export const filterToQuery = (filter: HubBenchmarkFilter): Prisma.HubBenchmarkWhereInput => {
  return {
    hubId: filter.hubId ?? undefined,
  };
};

export const dbHubBenchmarkSearch = async (filter: HubBenchmarkFilter): Promise<Page<HubBenchmark>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.hubBenchmark.count({ where: whereClause });
  const records = await prisma.hubBenchmark.findMany({
    where: whereClause,
    include: { hub: true },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? [{ hub: { name: 'asc' } }, { [filter.sortBy]: filter.sortOrder }] : [{ hub: { name: 'asc' } }, { ownerKm: 'asc' }],
  });
  return {
    records: records.map(dbHubBenchmarkToDomainWithRelations),
    total,
  };
};
