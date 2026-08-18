import { getPrismaClient } from '@/storage/utils';

export const dbEmailTemplateDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.emailTemplate.delete({
    where: { id },
  });
};
