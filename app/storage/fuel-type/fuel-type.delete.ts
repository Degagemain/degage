import { getPrismaClient } from '@/storage/utils';

export const dbFuelTypeDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.fuelType.delete({
    where: { id },
  });
};
