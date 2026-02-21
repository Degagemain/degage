import { getPrismaClient } from '@/storage/utils';

export const dbFiscalRegionDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.fiscalRegion.delete({
    where: { id },
  });
};
