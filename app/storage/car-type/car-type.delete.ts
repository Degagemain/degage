import { getPrismaClient } from '@/storage/utils';

export const dbCarTypeDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.carType.delete({
    where: { id },
  });
};
