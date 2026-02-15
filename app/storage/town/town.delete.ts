import { getPrismaClient } from '@/storage/utils';

export const dbTownDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.town.delete({
    where: { id },
  });
};
