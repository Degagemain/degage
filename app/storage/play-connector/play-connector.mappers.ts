import type { PlayConnectorStatus } from '@/domain/play-connector.model';
import type { Prisma } from '@/storage/client/client';

export type DbPlayConnector = Prisma.PlayConnectorGetPayload<Record<string, never>>;

export const dbPlayConnectorToStatus = (row: DbPlayConnector | null, now = new Date()): PlayConnectorStatus => {
  if (!row) {
    return {
      status: 'missing',
      email: null,
      loginBlockedUntil: null,
      sessionExpiresAt: null,
    };
  }

  const isFailing = row.credentialsInvalid || (row.loginBlockedUntil !== null && row.loginBlockedUntil.getTime() > now.getTime());

  return {
    status: isFailing ? 'failing' : 'success',
    email: row.email,
    loginBlockedUntil: row.loginBlockedUntil,
    sessionExpiresAt: row.sessionExpiresAt,
  };
};
