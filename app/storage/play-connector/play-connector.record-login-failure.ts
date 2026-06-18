import { getPrismaClient } from '@/storage/utils';
import type { DbPlayConnector } from './play-connector.mappers';

const LOGIN_BLOCK_SECONDS = 5;

export const dbPlayConnectorRecordLoginFailure = async (userId: string): Promise<DbPlayConnector> => {
  const prisma = getPrismaClient();
  const row = await prisma.playConnector.findUniqueOrThrow({ where: { userId } });
  const blockedUntil = new Date(Date.now() + LOGIN_BLOCK_SECONDS * 1000);

  return prisma.playConnector.update({
    where: { userId },
    data: {
      failedLoginCount: row.failedLoginCount + 1,
      credentialsInvalid: true,
      loginBlockedUntil: blockedUntil,
    },
  });
};
