import { getPrismaClient } from '@/storage/utils';

export const dbHubDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.hub.delete({
    where: { id },
  });
};
