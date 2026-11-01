import { getPrismaClient } from '@/storage/utils';

export const dbContractTypeDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.contractType.delete({
    where: { id },
  });
};
