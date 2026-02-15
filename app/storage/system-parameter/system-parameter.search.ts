import { SystemParameter } from '@/domain/system-parameter.model';
import { SystemParameterFilter } from '@/domain/system-parameter.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getRequestContentLocale } from '@/context/request-context';
import { dbSystemParameterToDomain } from './system-parameter.mappers';

export const filterToQuery = (filter: SystemParameterFilter): Prisma.SystemParameterWhereInput => {
  return {
    category: filter.category ?? undefined,
    ...(filter.query?.trim()
      ? {
          OR: [
            { code: { contains: filter.query.trim(), mode: 'insensitive' as const } },
            {
              translations: {
                some: {
                  name: {
                    contains: filter.query.trim(),
                    mode: 'insensitive',
                  },
                },
              },
            },
          ],
        }
      : {}),
  };
};

export const dbSystemParameterSearch = async (filter: SystemParameterFilter): Promise<Page<SystemParameter>> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const whereClause = filterToQuery(filter);
  const total = await prisma.systemParameter.count({
    where: whereClause,
  });
  const params = await prisma.systemParameter.findMany({
    where: whereClause,
    include: { translations: true, valueEuronorm: true },
    skip: filter.skip,
    take: filter.take,
    orderBy: { [filter.sortBy]: filter.sortOrder },
  });
  return {
    records: params.map((p) => dbSystemParameterToDomain(p, locale)),
    total,
  };
};
