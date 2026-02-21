import { getPrismaClient } from '@/storage/utils';

export const dbCarTaxEuroNormAdjustmentDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.carTaxEuroNormAdjustment.delete({
    where: { id },
  });
};
