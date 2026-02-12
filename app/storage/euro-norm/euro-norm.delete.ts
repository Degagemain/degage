import { getPrismaClient } from '@/storage/utils';

export const dbEuroNormDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.euroNorm.delete({
    where: { id },
  });
};
