import { getPrismaClient } from '@/storage/utils';

export const dbDocumentationGroupDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.documentationGroup.delete({
    where: { id },
  });
};
