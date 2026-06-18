import { getPrismaClient } from '@/storage/utils';
import type { DbPlayConnector } from './play-connector.mappers';

export type PlayConnectorSessionUpdate = {
  userId: string;
  encryptedSessionCookie: string;
  sessionExpiresAt: Date | null;
};

export const dbPlayConnectorUpdateSession = async (data: PlayConnectorSessionUpdate): Promise<DbPlayConnector> => {
  const prisma = getPrismaClient();

  return prisma.playConnector.update({
    where: { userId: data.userId },
    data: {
      encryptedSessionCookie: data.encryptedSessionCookie,
      sessionExpiresAt: data.sessionExpiresAt,
      credentialsInvalid: false,
      failedLoginCount: 0,
      loginBlockedUntil: null,
    },
  });
};
