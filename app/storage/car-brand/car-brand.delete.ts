import { getPrismaClient } from '@/storage/utils';

export const dbCarBrandDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.carBrand.delete({
    where: { id },
  });
};
