import { getPrismaClient } from '@/storage/utils';

export const dbCarOnboardingDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.carOnboarding.delete({
    where: { id },
  });
};
