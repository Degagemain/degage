import { CarOnboarding } from '@/domain/car-onboarding.model';
import { getPrismaClient } from '@/storage/utils';
import { carOnboardingToDbUpdate, dbCarOnboardingToDomain } from './car-onboarding.mappers';

export const dbCarOnboardingUpdate = async (onboarding: CarOnboarding): Promise<CarOnboarding> => {
  const prisma = getPrismaClient();
  if (onboarding.id == null) {
    throw new Error('CarOnboarding id is required for update');
  }
  const updated = await prisma.carOnboarding.update({
    where: { id: onboarding.id },
    data: carOnboardingToDbUpdate(onboarding),
  });
  return dbCarOnboardingToDomain(updated);
};
