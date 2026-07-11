import { RoadAssistancePlan } from '@/domain/road-assistance-plan.model';
import { RoadAssistancePlanFilter } from '@/domain/road-assistance-plan.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getRequestContentLocale } from '@/context/request-context';
import { dbRoadAssistancePlanToDomain } from './road-assistance-plan.mappers';

export const filterToQuery = (filter: RoadAssistancePlanFilter): Prisma.RoadAssistancePlanWhereInput => {
  return {
    isActive: filter.isActive !== null ? filter.isActive : undefined,
    translations: filter.query
      ? {
          some: {
            OR: [
              {
                name: {
                  contains: filter.query.trim(),
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: filter.query.trim(),
                  mode: 'insensitive',
                },
              },
            ],
          },
        }
      : undefined,
  };
};

export const dbRoadAssistancePlanSearch = async (filter: RoadAssistancePlanFilter): Promise<Page<RoadAssistancePlan>> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const whereClause = filterToQuery(filter);
  const total = await prisma.roadAssistancePlan.count({
    where: whereClause,
  });
  const roadAssistancePlans = await prisma.roadAssistancePlan.findMany({
    where: whereClause,
    include: { translations: true },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: roadAssistancePlans.map((plan) => dbRoadAssistancePlanToDomain(plan, locale)),
    total,
  };
};
