import { CarOnboarding } from '@/domain/car-onboarding.model';
import { getRequestContentLocale } from '@/context/request-context';
import { getPrismaClient } from '@/storage/utils';
import { dbCarOnboardingToDomain, dbCarOnboardingToDomainWithRelations } from './car-onboarding.mappers';

export const dbCarOnboardingRead = async (id: string): Promise<CarOnboarding> => {
  const prisma = getPrismaClient();
  const onboarding = await prisma.carOnboarding.findUniqueOrThrow({
    where: { id },
  });
  return dbCarOnboardingToDomain(onboarding);
};

export const dbCarOnboardingReadWithRelations = async (id: string): Promise<CarOnboarding> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const onboarding = await prisma.carOnboarding.findUniqueOrThrow({
    where: { id },
    include: {
      town: true,
      brand: { include: { translations: true } },
      fuelType: { include: { translations: true } },
      carType: true,
      insurer: true,
      owner: true,
      simulation: true,
    },
  });
  return dbCarOnboardingToDomainWithRelations(onboarding, locale);
};
