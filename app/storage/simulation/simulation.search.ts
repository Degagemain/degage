import { Simulation } from '@/domain/simulation.model';
import { SimulationFilter } from '@/domain/simulation.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getRequestContentLocale } from '@/context/request-context';
import { dbSimulationToDomainWithRelations } from './simulation.mappers';

export const filterToQuery = (filter: SimulationFilter): Prisma.SimulationWhereInput => {
  return {
    ...(filter.brandIds.length > 0 ? { brandId: { in: filter.brandIds } } : {}),
    ...(filter.fuelTypeIds.length > 0 ? { fuelTypeId: { in: filter.fuelTypeIds } } : {}),
    ...(filter.carTypeIds.length > 0 ? { carTypeId: { in: filter.carTypeIds } } : {}),
    ...(filter.resultCodes.length > 0 ? { resultCode: { in: filter.resultCodes } } : {}),
    ...(filter.query != null && filter.query.trim() !== ''
      ? {
          OR: [{ carTypeOther: { contains: filter.query.trim(), mode: 'insensitive' as const } }],
        }
      : {}),
  };
};

export const dbSimulationSearch = async (filter: SimulationFilter): Promise<Page<Simulation>> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const whereClause = filterToQuery(filter);
  const total = await prisma.simulation.count({
    where: whereClause,
  });
  const simulations = await prisma.simulation.findMany({
    where: whereClause,
    include: {
      brand: { include: { translations: true } },
      fuelType: { include: { translations: true } },
      carType: true,
    },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: simulations.map((s) => dbSimulationToDomainWithRelations(s, locale)),
    total,
  };
};
