import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';

export const readCarOnboarding = async (id: string) => {
  return dbCarOnboardingReadWithRelations(id);
};
