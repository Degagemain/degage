import { getPrismaClient } from '@/storage/utils';

export const dbDocumentationDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.documentation.delete({ where: { id } });
};
