import { getPrismaClient } from '@/storage/utils';

export const dbContractDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.contract.delete({
    where: { id },
  });
};
