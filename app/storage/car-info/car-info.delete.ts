import { getPrismaClient } from '@/storage/utils';

export const dbCarInfoDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.carInfo.delete({
    where: { id },
  });
};
