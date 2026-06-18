import { getPrismaClient } from '@/storage/utils';

export const dbPlayConnectorDeleteByUserId = async (userId: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.playConnector.deleteMany({ where: { userId } });
};
