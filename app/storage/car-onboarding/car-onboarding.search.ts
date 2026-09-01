import { CarOnboarding, CarOnboardingInPreparationStatus, PREPARATION_NUDGE_COOLDOWN_MS } from '@/domain/car-onboarding.model';
import { CarOnboardingFilter } from '@/domain/car-onboarding.filter';
import { Page } from '@/domain/page.model';
import { getRequestContentLocale } from '@/context/request-context';
import { getPrismaClient } from '@/storage/utils';
import { Prisma } from '@/storage/client/client';
import { carOnboardingRelationsInclude, dbCarOnboardingToDomainWithRelations } from './car-onboarding.mappers';

export const filterToQuery = (filter: CarOnboardingFilter): Prisma.CarOnboardingWhereInput => {
  return {
    ...(filter.excludeId != null ? { id: { not: filter.excludeId } } : {}),
    ...(filter.carName != null && filter.carName.trim() !== ''
      ? { carName: { equals: filter.carName.trim(), mode: 'insensitive' as const } }
      : {}),
    ...(filter.statusInPreparation.length > 0 ? { statusInPreparation: { in: filter.statusInPreparation } } : {}),
    ...(filter.carValueStatuses.length > 0 ? { carValueStatus: { in: filter.carValueStatuses } } : {}),
    ...(filter.insurerStatuses.length > 0 ? { insurerStatus: { in: filter.insurerStatuses } } : {}),
    ...(filter.query != null && filter.query.trim() !== ''
      ? {
          OR: [
            { street: { contains: filter.query.trim(), mode: 'insensitive' as const } },
            { houseNumber: { contains: filter.query.trim(), mode: 'insensitive' as const } },
            { phone: { contains: filter.query.trim(), mode: 'insensitive' as const } },
            { carTypeOther: { contains: filter.query.trim(), mode: 'insensitive' as const } },
            { carName: { contains: filter.query.trim(), mode: 'insensitive' as const } },
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
    include: carOnboardingRelationsInclude,
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: records.map((record) => dbCarOnboardingToDomainWithRelations(record, locale)),
    total,
  };
};

export const dueForPreparationNudgeWhere = (now: Date): Prisma.CarOnboardingWhereInput => {
  const cutoff = new Date(now.getTime() - PREPARATION_NUDGE_COOLDOWN_MS);
  return {
    preparationConfirmedAt: null,
    statusInPreparation: CarOnboardingInPreparationStatus.OPEN,
    ownerId: { not: null },
    owner: {
      email: { not: '' },
    },
    OR: [{ lastPreparationNudgeEmail: null }, { lastPreparationNudgeEmail: { lt: cutoff } }],
  };
};

export type CarOnboardingPreparationNudgeCandidate = {
  onboarding: CarOnboarding;
  ownerEmail: string;
  ownerLocale: string | null;
};

export const dbCarOnboardingSearchDueForPreparationNudge = async (
  now: Date = new Date(),
): Promise<CarOnboardingPreparationNudgeCandidate[]> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const records = await prisma.carOnboarding.findMany({
    where: dueForPreparationNudgeWhere(now),
    include: carOnboardingRelationsInclude,
  });

  return records.flatMap((record) => {
    const ownerEmail = record.owner?.email?.trim();
    if (!ownerEmail) return [];
    return [
      {
        onboarding: dbCarOnboardingToDomainWithRelations(record, locale),
        ownerEmail,
        ownerLocale: record.owner?.locale ?? null,
      },
    ];
  });
};
