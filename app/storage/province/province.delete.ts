import { getPrismaClient } from '@/storage/utils';

export const dbProvinceDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.province.delete({
    where: { id },
  });
};
