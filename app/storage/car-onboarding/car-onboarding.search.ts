import { CarOnboarding } from '@/domain/car-onboarding.model';
import { CarOnboardingFilter } from '@/domain/car-onboarding.filter';
import { Page } from '@/domain/page.model';
import { getRequestContentLocale } from '@/context/request-context';
import { getPrismaClient } from '@/storage/utils';
import { Prisma } from '@/storage/client/client';
import { dbCarOnboardingToDomainWithRelations } from './car-onboarding.mappers';

export const filterToQuery = (filter: CarOnboardingFilter): Prisma.CarOnboardingWhereInput => {
  return {
    ...(filter.statusInPreparation.length > 0 ? { statusInPreparation: { in: filter.statusInPreparation } } : {}),
    ...(filter.carValueStatuses.length > 0 ? { carValueStatus: { in: filter.carValueStatuses } } : {}),
    ...(filter.insurerStatuses.length > 0 ? { insurerStatus: { in: filter.insurerStatuses } } : {}),
    ...(filter.query != null && filter.query.trim() !== ''
      ? {
          OR: [
            { street: { contains: filter.query.trim(), mode: 'insensitive' as const } },
            { phone: { contains: filter.query.trim(), mode: 'insensitive' as const } },
            { carTypeOther: { contains: filter.query.trim(), mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };
};

export const dbCarOnboardingSearch = async (filter: CarOnboardingFilter): Promise<Page<CarOnboarding>> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const whereClause = filterToQuery(filter);
  const total = await prisma.carOnboarding.count({
    where: whereClause,
  });
  const records = await prisma.carOnboarding.findMany({
    where: whereClause,
    include: {
      town: true,
      brand: { include: { translations: true } },
      fuelType: { include: { translations: true } },
      carType: true,
      insurer: true,
      owner: true,
      simulation: true,
    },
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: records.map((record) => dbCarOnboardingToDomainWithRelations(record, locale)),
    total,
  };
};
