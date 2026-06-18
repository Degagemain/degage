import { getPrismaClient } from '@/storage/utils';
import type { DbPlayConnector } from './play-connector.mappers';

export type PlayConnectorUpsertData = {
  userId: string;
  email: string;
  encryptedPassword: string;
  encryptedSessionCookie: string;
  sessionExpiresAt: Date | null;
};

export const dbPlayConnectorUpsert = async (data: PlayConnectorUpsertData): Promise<DbPlayConnector> => {
  const prisma = getPrismaClient();

  return prisma.playConnector.upsert({
    where: { userId: data.userId },
    create: {
      userId: data.userId,
      email: data.email,
      encryptedPassword: data.encryptedPassword,
      encryptedSessionCookie: data.encryptedSessionCookie,
      sessionExpiresAt: data.sessionExpiresAt,
      credentialsInvalid: false,
      failedLoginCount: 0,
      loginBlockedUntil: null,
    },
    update: {
      email: data.email,
      encryptedPassword: data.encryptedPassword,
      encryptedSessionCookie: data.encryptedSessionCookie,
      sessionExpiresAt: data.sessionExpiresAt,
      credentialsInvalid: false,
      failedLoginCount: 0,
      loginBlockedUntil: null,
    },
  });
};
