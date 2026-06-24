import { dbCarOnboardingDelete } from '@/storage/car-onboarding/car-onboarding.delete';

export const deleteCarOnboarding = async (id: string): Promise<void> => {
  return dbCarOnboardingDelete(id);
};
