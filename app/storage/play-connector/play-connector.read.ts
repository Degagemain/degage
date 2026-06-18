import { getPrismaClient } from '@/storage/utils';
import type { DbPlayConnector } from './play-connector.mappers';

export const dbPlayConnectorReadByUserId = async (userId: string): Promise<DbPlayConnector | null> => {
  const prisma = getPrismaClient();
  return prisma.playConnector.findUnique({ where: { userId } });
};
