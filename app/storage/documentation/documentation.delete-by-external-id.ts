import { getPrismaClient } from '@/storage/utils';

export const dbDocumentationDeleteByExternalId = async (externalId: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.documentation.deleteMany({ where: { externalId } });
};
