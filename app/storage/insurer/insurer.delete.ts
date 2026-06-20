import { getPrismaClient } from '@/storage/utils';

export const dbInsurerDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.insurer.delete({
    where: { id },
  });
};
