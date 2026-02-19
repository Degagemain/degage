import { getPrismaClient } from '@/storage/utils';

export const dbCarPriceEstimateDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.carPriceEstimate.delete({
    where: { id },
  });
};
