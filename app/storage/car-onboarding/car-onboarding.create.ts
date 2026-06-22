import { CarOnboarding } from '@/domain/car-onboarding.model';
import { getPrismaClient } from '@/storage/utils';
import { carOnboardingToDbCreate, dbCarOnboardingToDomain } from './car-onboarding.mappers';

export const dbCarOnboardingCreate = async (onboarding: CarOnboarding): Promise<CarOnboarding> => {
  const prisma = getPrismaClient();
  const created = await prisma.carOnboarding.create({
    data: carOnboardingToDbCreate(onboarding),
  });
  return dbCarOnboardingToDomain(created);
};
