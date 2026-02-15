import { SimulationRegion } from '@/domain/simulation-region.model';
import { SimulationRegionFilter } from '@/domain/simulation-region.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { dbSimulationRegionToDomain } from './simulation-region.mappers';

export const filterToQuery = (filter: SimulationRegionFilter): Prisma.SimulationRegionWhereInput => {
  const q = filter.query?.trim();
  return {
    name: q ? { contains: q, mode: 'insensitive' } : undefined,
    isDefault: filter.isDefault !== null ? filter.isDefault : undefined,
  };
};

export const dbSimulationRegionSearch = async (filter: SimulationRegionFilter): Promise<Page<SimulationRegion>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.simulationRegion.count({
    where: whereClause,
  });
  const regions = await prisma.simulationRegion.findMany({
    where: whereClause,
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: regions.map(dbSimulationRegionToDomain),
    total,
  };
};
