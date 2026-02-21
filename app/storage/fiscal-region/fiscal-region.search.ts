import { FiscalRegion } from '@/domain/fiscal-region.model';
import { FiscalRegionFilter } from '@/domain/fiscal-region.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getRequestContentLocale } from '@/context/request-context';
import { dbFiscalRegionToDomain } from './fiscal-region.mappers';

export const filterToQuery = (filter: FiscalRegionFilter): Prisma.FiscalRegionWhereInput => {
  return {
    isDefault: filter.isDefault !== null ? filter.isDefault : undefined,
    translations: filter.query
      ? {
          some: {
            name: {
              contains: filter.query.trim(),
              mode: 'insensitive',
            },
          },
        }
      : undefined,
  };
};

export const dbFiscalRegionSearch = async (filter: FiscalRegionFilter): Promise<Page<FiscalRegion>> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const whereClause = filterToQuery(filter);
  const total = await prisma.fiscalRegion.count({
    where: whereClause,
  });
  const fiscalRegions = await prisma.fiscalRegion.findMany({
    where: whereClause,
    include: { translations: true },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: fiscalRegions.map((fr) => dbFiscalRegionToDomain(fr, locale)),
    total,
  };
};
