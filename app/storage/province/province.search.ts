import { Province } from '@/domain/province.model';
import { ProvinceFilter } from '@/domain/province.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { dbProvinceToDomain } from './province.mappers';

export const filterToQuery = (filter: ProvinceFilter): Prisma.ProvinceWhereInput => {
  const q = filter.query?.trim();
  return {
    name: q ? { contains: q, mode: 'insensitive' } : undefined,
  };
};

export const dbProvinceSearch = async (filter: ProvinceFilter): Promise<Page<Province>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.province.count({
    where: whereClause,
  });
  const provinces = await prisma.province.findMany({
    where: whereClause,
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: provinces.map(dbProvinceToDomain),
    total,
  };
};
